<template>
  <view class="container">
    <view class="winter-ornament o1"></view>
    <view class="winter-ornament o2"></view>
    <view class="winter-ornament o3"></view>
    <view class="content" v-if="!showScanner">
      <view class="scan-card">
        <view class="scan-btn-circle" @click="startScan">
          <view class="scan-ring ring-outer"></view>
          <view class="scan-ring ring-inner"></view>
          <view class="scan-icon-box">
            <image class="scan-icon-image" src="/static/icons/camera-soft.svg" mode="aspectFit"></image>
          </view>
        </view>
        <text class="scan-label">点击开始扫码</text>
      </view>

      <view class="tips-card">
        <view class="tips-header">
          <text class="tips-title">扫码小技巧</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">·</text>
          <text class="tip-text">请保持商品条码位于识别框内</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">·</text>
          <text class="tip-text">如果画面模糊，可稍微拉远手机距离</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">·</text>
          <text class="tip-text">光线充足时，扫描效果会更稳定</text>
        </view>

        <view class="test-codes">
          <text class="test-title">可供测试的条码</text>
          <view class="code-row">
            <text class="code-name">农夫山泉</text>
            <text class="code-value">6921168511280</text>
          </view>
          <view class="code-row">
            <text class="code-name">脉动饮料</text>
            <text class="code-value">6902538004045</text>
          </view>
          <view class="code-row">
            <text class="code-name">百事可乐</text>
            <text class="code-value">6925303711119</text>
          </view>
        </view>
      </view>
    </view>

    <view class="scanner-overlay" v-if="showScanner">
      <view class="scanner-wrap">
        <view id="reader" class="reader-view"></view>
        <view class="scanner-footer">
          <view class="cancel-btn" @click="stopScan">
            <text class="cancel-text">取消扫码</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// #ifdef H5
import { Html5Qrcode } from 'html5-qrcode';
// #endif

export default {
  data() {
    return {
      showScanner: false,
      html5QrCode: null
    }
  },
  methods: {
    startScan() {
      // #ifdef H5
      this.showScanner = true;
      this.$nextTick(() => {
        if (!this.html5QrCode) {
          this.html5QrCode = new Html5Qrcode('reader');
        }
        this.html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 300, height: 180 }
          },
          (decodedText) => {
            uni.showToast({ title: '已识别条码', icon: 'success' });
            this.stopScan();
            this.handleScanResult(decodedText);
          },
          () => {}
        ).catch(() => {
          uni.showToast({ title: '相机启动失败', icon: 'none' });
          this.showScanner = false;
        });
      });
      // #endif

      // #ifndef H5
      uni.scanCode({
        scanType: ['barCode', 'qrCode'],
        success: (res) => {
          this.handleScanResult(res.result);
        }
      });
      // #endif
    },
    stopScan() {
      // #ifdef H5
      if (this.html5QrCode && this.html5QrCode.isScanning) {
        this.html5QrCode.stop().then(() => {
          this.html5QrCode.clear();
          this.showScanner = false;
        }).catch(() => {
          this.showScanner = false;
        });
      } else {
        this.showScanner = false;
      }
      // #endif
    },
    handleScanResult(barcode) {
      uni.navigateTo({
        url: `/pages/result/result?code=${barcode}`
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background:
    linear-gradient(180deg, #f7e7d7 0%, #f8efe5 45%, #fff8f0 100%);
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

.winter-ornament {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 247, 238, 0.6);
  border: 1rpx solid rgba(222, 181, 143, 0.55);
  backdrop-filter: blur(8rpx);
}

.o1 {
  width: 200rpx;
  height: 200rpx;
  top: -40rpx;
  left: -60rpx;
}

.o2 {
  width: 120rpx;
  height: 120rpx;
  top: 120rpx;
  right: 40rpx;
}

.o3 {
  width: 160rpx;
  height: 160rpx;
  top: 420rpx;
  right: -40rpx;
}

.content {
  padding: 30rpx;
  position: relative;
  z-index: 2;
}

.scan-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.95), transparent 30%),
    linear-gradient(145deg, rgba(255, 251, 246, 0.98), rgba(248, 236, 222, 0.94));
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1rpx solid rgba(224, 190, 155, 0.42);
  box-shadow:
    0 18rpx 44rpx rgba(152, 104, 68, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
}

.scan-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 26rpx;
  right: 26rpx;
  height: 8rpx;
  border-radius: 0 0 999rpx 999rpx;
  background: rgba(248, 236, 222, 0.94);
}

.scan-card::after {
  content: '';
  position: absolute;
  width: 180rpx;
  height: 180rpx;
  top: -70rpx;
  right: -50rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 204, 168, 0.42) 0%, rgba(245, 204, 168, 0) 70%);
}

.scan-btn-circle {
  position: relative;
  width: 220rpx;
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-ring {
  position: absolute;
  border-radius: 50%;
  border: 4rpx solid rgba(210, 149, 95, 0.28);
}

.ring-outer {
  width: 220rpx;
  height: 220rpx;
  animation: pulse 2s ease-in-out infinite;
}

.ring-inner {
  width: 180rpx;
  height: 180rpx;
  border-color: rgba(242, 204, 170, 0.9);
  animation: pulse 2s ease-in-out 0.3s infinite;
}

.scan-icon-box {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #fff7ef 0%, #f9dec2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(180, 118, 67, 0.18);
  z-index: 2;
}

.scan-icon-image {
  width: 68rpx;
  height: 68rpx;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.5;
  }
}

.scan-label {
  font-size: 34rpx;
  font-weight: bold;
  color: #7c4627;
  margin-top: 30rpx;
}


.tips-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.96), transparent 32%),
    linear-gradient(160deg, rgba(255, 251, 247, 0.98), rgba(249, 239, 229, 0.95));
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: 30rpx;
  border: 1rpx solid rgba(224, 190, 155, 0.38);
  box-shadow:
    0 14rpx 32rpx rgba(152, 104, 68, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
}

.tips-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0, rgba(255, 255, 255, 0.18) 8rpx, transparent 8rpx, transparent 28rpx);
  opacity: 0.22;
  pointer-events: none;
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}


.tips-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #7c4627;
}

.tip-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.tip-dot {
  color: #d88b50;
  font-size: 32rpx;
  margin-right: 14rpx;
  font-weight: bold;
}

.tip-text {
  font-size: 26rpx;
  color: #967256;
}

.test-codes {
  margin-top: 30rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #fff6ee 0%, #f8eadc 100%);
  border-radius: 16rpx;
}

.test-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #b56834;
  margin-bottom: 16rpx;
  display: block;
}

.code-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1rpx dashed rgba(210, 149, 95, 0.24);
}

.code-row:last-child {
  border-bottom: none;
}

.code-name {
  font-size: 24rpx;
  color: #8b684d;
  font-weight: 500;
}

.code-value {
  font-size: 24rpx;
  color: #a45a2f;
  font-family: monospace;
}

.scanner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(56, 35, 24, 0.84);
  z-index: 9999;
}

.scanner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40rpx;
}

.reader-view {
  width: 100%;
  aspect-ratio: 1;
  background-color: #000;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 0 60rpx rgba(210, 149, 95, 0.28);
}

.scanner-footer {
  margin-top: 60rpx;
}

.cancel-btn {
  background: linear-gradient(135deg, #e6a76d 0%, #c46a33 100%);
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
}

.cancel-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
</style>



