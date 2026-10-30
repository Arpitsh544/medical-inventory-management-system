@echo off
setlocal
pushd "%~dp0"

where python >nul 2>&1
if errorlevel 1 (
  echo Python 3 was not found. Install Python 3, then run this file again.
  pause
  exit /b 1
)

python serve.py
if errorlevel 1 (
  echo.
  echo MedStock could not start. Read the error above, then press any key to close.
  pause >nul
)

popd

