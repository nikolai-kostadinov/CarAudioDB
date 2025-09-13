#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>
#include <stdint.h>
#include <SEGGER_RTT.h>   // <-- use RTT directly

LOG_MODULE_REGISTER(color_collect, LOG_LEVEL_INF);

struct Sample { int32_t R, G, B, SUM; uint8_t label; };
#ifndef MAX_SAMPLES
#define MAX_SAMPLES 2000
#endif

static Sample ds[MAX_SAMPLES];
static volatile int ds_count = 0;
static volatile uint8_t current_label = 0;
static volatile bool capture_req = false;
static volatile bool dump_req = false;
static volatile bool clear_req = false;

static int fetch_with_retry(const device *dev, int tries = 5, int ms = 20) {
    for (int i = 0; i < tries; ++i) {
        int rc = sensor_sample_fetch(dev);
        if (rc == 0) return 0;
        if (rc == -EAGAIN) { k_sleep(K_MSEC(ms)); continue; }
        return rc;
    }
    return -EAGAIN;
}

static inline int sv2i(const sensor_value &v) { return (int)v.val1; }

/* ---- Blocking getchar over RTT terminal 0 ---- */
static int rtt_getchar_blocking() {
    int ch;
    while ((ch = SEGGER_RTT_GetKey()) < 0) {
        k_sleep(K_MSEC(1));
    }
    return ch;
}

/* Keys: 0–9 label, space capture, d dump, c clear, h help */
static void input_thread(void*, void*, void*) {
    printk("RTT keys: [0-9]=label  <space>=capture  d=dump  c=clear  h=help\n");
    for (;;) {
        int ch = rtt_getchar_blocking();
        if (ch == ' ') capture_req = true;
        else if (ch == 'd' || ch == 'D') dump_req = true;
        else if (ch == 'c' || ch == 'C') clear_req = true;
        else if (ch == 'h' || ch == 'H')
            printk("RTT keys: [0-9]=label  <space>=capture  d=dump  c=clear\n");
        else if (ch >= '0' && ch <= '9') {
            current_label = (uint8_t)(ch - '0');
            printk("label=%d\n", current_label);
        }
    }
}

K_THREAD_STACK_DEFINE(input_stack, 1024);
static struct k_thread input_tcb;

extern "C" void app_main(void)
{
    const device *color = DEVICE_DT_GET_ONE(rohm_bh1749);
    if (!device_is_ready(color)) { LOG_ERR("BH1749 not ready"); return; }
    LOG_INF("BH1749 ready");

    k_thread_create(&input_tcb, input_stack, K_THREAD_STACK_SIZEOF(input_stack),
                    input_thread, nullptr, nullptr, nullptr, 7, 0, K_NO_WAIT);

    while (1) {
        if (fetch_with_retry(color) == 0) {
            struct sensor_value rv, gv, bv;
            sensor_channel_get(color, SENSOR_CHAN_RED,   &rv);
            sensor_channel_get(color, SENSOR_CHAN_GREEN, &gv);
            sensor_channel_get(color, SENSOR_CHAN_BLUE,  &bv);

            int32_t R = sv2i(rv), G = sv2i(gv), B = sv2i(bv);
            int32_t SUM = R + G + B;

            if (capture_req) {
                capture_req = false;
                if (ds_count < MAX_SAMPLES) {
                    ds[ds_count++] = Sample{R, G, B, SUM, current_label};
                    printk("CAP,%d,%ld,%ld,%ld,%ld\n",
                           (int)current_label, (long)R, (long)G, (long)B, (long)SUM);
                } else {
                    printk("BUFFER FULL (%d)\n", ds_count);
                }
            }

            if (dump_req) {
                dump_req = false;
                printk("label,R,G,B,sum\n");
                for (int i = 0; i < ds_count; ++i) {
                    printk("%d,%ld,%ld,%ld,%ld\n",
                           (int)ds[i].label, (long)ds[i].R, (long)ds[i].G,
                           (long)ds[i].B, (long)ds[i].SUM);
                }
                printk("END,%d rows\n", ds_count);
            }

            if (clear_req) { clear_req = false; ds_count = 0; printk("CLEARED\n"); }
        }

        k_sleep(K_MSEC(200));
    }
}
