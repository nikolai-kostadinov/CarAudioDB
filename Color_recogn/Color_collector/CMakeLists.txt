cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(color_collector C CXX)

target_sources(app PRIVATE
  src/entry.c
  src/main.cpp
)

# Optional but nice
set_property(TARGET app PROPERTY CXX_STANDARD 17)
