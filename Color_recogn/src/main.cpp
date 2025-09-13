#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

#undef ROUND_UP
/* Edge Impulse */

#include "edge-impulse-sdk/classifier/ei_run_classifier.h"
#include "model-parameters/model_metadata.h"

LOG_MODULE_REGISTER(color_ei, LOG_LEVEL_INF);

static float kR = 1.0f, kG = 1.0f, kB = 1.0f;

static int fetch_with_retry(const device *dev, int tries = 5, int ms = 20) {
    for (int i = 0; i < tries; ++i) {
        int rc = sensor_sample_fetch(dev);
        if (rc == 0) return 0;
        if (rc == -EAGAIN) { k_sleep(K_MSEC(ms)); continue; }
        LOG_ERR("fetch err %d", rc);
        return rc;
    }
    LOG_WRN("no valid data yet");
    return -EAGAIN;
}

static inline double sv2d(const sensor_value &v) {
    return sensor_value_to_double(&v);
}

/* Optional white calibration */
static void white_calibrate(const device *dev) {
    struct sensor_value rv, gv, bv;
    double R=0, G=0, B=0;
    for (int i = 0; i < 5; i++) {
        (void)fetch_with_retry(dev);
        sensor_channel_get(dev, SENSOR_CHAN_RED,   &rv);
        sensor_channel_get(dev, SENSOR_CHAN_GREEN, &gv);
        sensor_channel_get(dev, SENSOR_CHAN_BLUE,  &bv);
        R += sv2d(rv); G += sv2d(gv); B += sv2d(bv);
        k_sleep(K_MSEC(50));
    }
    R/=5.0; G/=5.0; B/=5.0;
    if (R > 1.0) kR = 1.0 / (float)R;
    if (G > 1.0) kG = 1.0 / (float)G;
    if (B > 1.0) kB = 1.0 / (float)B;
    LOG_INF("WB gains: kR=%.4f kG=%.4f kB=%.4f", (double)kR, (double)kG, (double)kB);
}

extern "C" void app_main(void)
{
    const device *color = DEVICE_DT_GET_ONE(rohm_bh1749);
    if (!device_is_ready(color)) {
        LOG_ERR("BH1749 not ready");
        return;
    }
    LOG_INF("BH1749 ready");

    // white_calibrate(color); // optional

#if defined(EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE)
    if (EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE != 4) {
        LOG_ERR("Model expects %d features, app builds 4 (R,G,B,sum)",
                EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE);
        return;
    }
#endif

    constexpr int VOTE_N = 5;
    int votes[EI_CLASSIFIER_LABEL_COUNT] = {0};
    int vote_hist[VOTE_N]; for (int &v : vote_hist) v = -1;
    int vote_idx = 0;

    while (1) {
        if (fetch_with_retry(color) == 0) {
            struct sensor_value rv, gv, bv;
            sensor_channel_get(color, SENSOR_CHAN_RED,   &rv);
            sensor_channel_get(color, SENSOR_CHAN_GREEN, &gv);
            sensor_channel_get(color, SENSOR_CHAN_BLUE,  &bv);

            float R = (float)sv2d(rv) * kR;
            float G = (float)sv2d(gv) * kG;
            float B = (float)sv2d(bv) * kB;
            float sum = R + G + B;

            float features[4] = { R, G, B, sum };

            signal_t signal;
            numpy::signal_from_buffer(features, 4, &signal);

            ei_impulse_result_t result = {0};
            auto rc = run_classifier(&signal, &result, false);
            if (rc != EI_IMPULSE_OK) {
                LOG_ERR("run_classifier failed (%d)", rc);
                k_sleep(K_MSEC(100));
                continue;
            }

            int best_idx = 0;
            float best_val = result.classification[0].value;
            for (size_t i = 1; i < EI_CLASSIFIER_LABEL_COUNT; ++i) {
                float v = result.classification[i].value;
                if (v > best_val) { best_val = v; best_idx = (int)i; }
            }

            if (vote_hist[vote_idx] != -1) votes[vote_hist[vote_idx]]--;
            vote_hist[vote_idx] = best_idx;
            votes[best_idx]++;
            vote_idx = (vote_idx + 1) % VOTE_N;

            int voted_idx = 0;
            for (size_t i = 1; i < EI_CLASSIFIER_LABEL_COUNT; ++i)
                if (votes[i] > votes[voted_idx]) voted_idx = (int)i;

            const float THRESH = 0.70f;
            const char *label = result.classification[voted_idx].label;
            float conf = result.classification[voted_idx].value;

            if (conf >= THRESH) {
                LOG_INF("Pred: %s (%.2f)  R=%.0f G=%.0f B=%.0f sum=%.0f",
                        label, (double)conf, (double)R, (double)G, (double)B, (double)sum);
            } else {
                LOG_INF("Low conf (%.2f)  R=%.0f G=%.0f B=%.0f sum=%.0f",
                        (double)conf, (double)R, (double)G, (double)B, (double)sum);
            }
        }
        k_sleep(K_MSEC(200));
    }
}
