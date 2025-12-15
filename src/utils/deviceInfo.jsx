// src/utils/deviceInfo.js
export function getDeviceInfo() {
  return {
    device_name: navigator.platform || "Unknown",
    user_agent: navigator.userAgent,
  };
}
