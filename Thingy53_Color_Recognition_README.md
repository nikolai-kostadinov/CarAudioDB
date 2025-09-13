# 🎨 Thingy53 Color Recognition System

An embedded system using the **Nordic Thingy:53** and Edge Impulse to recognize colors in real time.  
Data is sent to the host via **J-Link RTT logging** for monitoring and debugging.

---

## 📌 Table of Contents
- [Description](#description)
- [Requirements](#requirements)
- [Hardware Setup](#hardware-setup)
- [Software Installation](#software-installation)
- [Step-by-Step Guide](#step-by-step-guide)
- [Edge Impulse Model Training](#edge-impulse-model-training)
- [Demo Video](#demo-video)
- [Project Structure](#project-structure)
- [Sample Output](#sample-output)

---

## 🧾 Description
This project implements a color classification system using:
- **Nordic Thingy:53** as the sensor platform  
- Built-in color sensor for data acquisition  
- A trained Edge Impulse model deployed 
- **J-Link RTT Viewer** for real-time logging of predictions

It demonstrates how to integrate machine learning models on Nordic hardware using the nRF Connect SDK and VS Code.

---

## ⚙️ Requirements

### Hardware
- Nordic **Thingy:53**
- Micro USB cable
- J-Link debugger (or any type of debugger for thingy53)

### Software
- [nRF Connect for VS Code](https://marketplace.visualstudio.com/items?itemName=nordic-semiconductor.nrf-connect)
- [nRF Command Line Tools](https://www.nordicsemi.com/Products/Development-tools/nrf-command-line-tools)
- [J-Link RTT Viewer](https://www.segger.com/products/debug-probes/j-link/tools/rtt-viewer/)

---

## 🔧 Hardware Setup
1. Connect Thingy53 via USB to your PC.
2. Connect the debugger to Thingy53 with j-link cable
3. Connect the debugger to your PC.
4. Power ON Thing53

---

## 💻 Software Installation
1. Install the nRF Connect SDK and VS Code extension.
2. Clone this repository:
   ```bash
   git clone https://github.com/rndbg/nrf53-color-detector.git
   ```
3. Open the project in **VS Code** using the *nRF Connect* extension.
4. Build and flash the application:
   - Select your board: `thingy53_nrf5340_cpuapp`
   - Click **Build → Flash**.

5. Open **J-Link RTT Viewer** to see logs.

---

## 🚀 Step-by-Step Guide
1. Power on and connect the Thingy:53.
2. Start **RTT Viewer** to monitor output.
3. Place a colored object near the sensor.
4. The device will log the detected color class and confidence.

---

## 🧠 Edge Impulse Model Training
To achieve the best accuracy, **train your own model under your environmental conditions**. Below is a guide based on what was used in this project:

1. **Upload Your Data**
   - Sign in to [Edge Impulse Studio](https://studio.edgeimpulse.com/).
   - Create a new project (e.g., *Color Recognition Thingy53*).
   - Go to **Data acquisition → Upload existing data**.
   - Upload record new samples of colors in different conditions.
   - Use the Color_collector project and follow the steps when you run the code

2. **Create Impulse**
   - Navigate to **Create impulse**.
   - Add processing and learning blocks (e.g., *Spectral Analysis* → *Classification*).

   - ![Task_1](https://imgur.com/a/O43qkEO)

3. **Follow Edge Impulse Instructions**
   - Configure parameters as described on their website for your selected blocks.
   - Click **Save impulse** when done.

4. **Train the Classifier**
   - Go to the **Classifier** tab.

   - ![Task_2](https://imgur.com/19gts6E)

5. **Deploy the Model**
   - Open the **Deployment** tab.
   - Use EON Compiler.
   - Set target : Nordic nRF5340 DK (Cortex M33 128MHz)
   - Click Build
   - Download the generated project files and integrate them into your firmware.

6. **Include the Edge Impulse Project in CMakeLists.txt**
   Add the following lines to your `CMakeLists.txt`:
   ```cmake
   add_subdirectory(edge-impulse)
   target_include_directories(app PRIVATE
     ${CMAKE_CURRENT_SOURCE_DIR}/edge-impulse
     ${CMAKE_CURRENT_SOURCE_DIR}/edge-impulse/edge-impulse-sdk
     ${CMAKE_CURRENT_SOURCE_DIR}/edge-impulse/model-parameters
   )
   # Make sure C
   ```

---

## 🎥 Demo Video
📌 *[Add link to your demo video here]*

---

## 📂 Project Structure
```
Color_recogn/
├── build/                  # Build artifacts
├── src/
│   ├── cpp_runtime_shims.cpp              # Application code
│   ├── main.cpp        # Edge Impulse model data
│   |── entry.c
|   |── static_init_flag.c 
├── prj.conf                # Zephyr configuration
├── CMakeLists.txt
└── edge_impulse          # or however your edge impulse model is called
```

---


### ✅ Notes
- Ensure consistent lighting for best results.
- Retrain the model if the environment or colors change.
- Keep the `CMakeLists.txt` references aligned with your downloaded Edge Impulse project.
