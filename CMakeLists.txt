cmake_minimum_required(VERSION 3.20.0)

find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(Color_recogn C CXX)

# Your sources (C++)
target_sources(app PRIVATE
  src/entry.c
  src/main.cpp
  src/cpp_runtime_shims.cpp   # keep the tiny ABI shims
)
set(CONF_FILE prj.conf)

# C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Edge Impulse
add_subdirectory(edge-impulse)
target_include_directories(app PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/edge-impulse
  ${CMAKE_CURRENT_SOURCE_DIR}/edge-impulse/edge-impulse-sdk
  ${CMAKE_CURRENT_SOURCE_DIR}/edge-impulse/model-parameters
)
# Make sure C++ runtime is linked (you likely already have one of these)
zephyr_link_libraries(stdc++ supc++)
# If the above macro is unknown on your NCS, use:
# target_link_libraries(app PRIVATE stdc++ supc++)

# Inject our linker fragment so STATIC_INIT_GNU is defined for ALL link stages (incl. zephyr_pre0)
zephyr_linker_sources(SECTIONS ${CMAKE_CURRENT_SOURCE_DIR}/ld/enable_static_init_gnu.ld)

# (Belt-and-suspenders: also pass the flag to the linker)
add_link_options(-Wl,--defsym=STATIC_INIT_GNU=1)

# Link C++ runtime (needed for std::function, new/delete, etc.)
# If the first line errors, use the fallback line instead.
