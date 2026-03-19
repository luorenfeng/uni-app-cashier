<template>
  <view class="container">
    <view class="content" v-if="!showScanner">
      <view class="scan-card">
        <view class="scan-btn-circle" @click="startScan">
          <view class="scan-ring ring-outer"></view>
          <view class="scan-ring ring-inner"></view>
          <view class="scan-icon-box">
            <text class="scan-icon-text">扫</text>
          </view>
        </view>
        <text class="scan-label">点击开始扫码</text>
        <text class="scan-hint">将相机对准商品条形码即可识别</text>
      </view>

      <view class="tips-card">
        <view class="tips-header">
          <text class="tips-icon">提</text>
          <text class="tips-title">扫码小技巧</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">请保持商品条码位于识别框内</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">如果模糊，可稍微拉远手机距离</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
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
  background-color: #f2f4f8;
  min-height: 100vh;
  overflow: hidden;
}

.content {
  padding: 30rpx;
  position: relative;
}

.scan-card {
  background: #fff;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10rpx 40rpx rgba(211, 84, 0, 0.15);
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
  border: 4rpx solid rgba(230, 126, 34, 0.3);
}

.ring-outer {
  width: 220rpx;
  height: 220rpx;
  animation: pulse 2s ease-in-out infinite;
}

.ring-inner {
  width: 180rpx;
  height: 180rpx;
  border-color: rgba(192, 57, 43, 0.4);
  animation: pulse 2s ease-in-out 0.3s infinite;
}

.scan-icon-box {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(211, 84, 0, 0.4);
  z-index: 2;
}

.scan-icon-text {
  font-size: 56rpx;
  color: #fff;
  font-weight: bold;
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
  color: #333;
  margin-top: 30rpx;
}

.scan-hint {
  font-size: 24rpx;
  color: #aaa;
  margin-top: 10rpx;
}

.tips-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.tips-icon {
  font-size: 30rpx;
  margin-right: 12rpx;
  color: #e67e22;
  font-weight: bold;
}

.tips-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.tip-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.tip-dot {
  color: #e67e22;
  font-size: 32rpx;
  margin-right: 14rpx;
  font-weight: bold;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
}

.test-codes {
  margin-top: 30rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #fdf2e9 0%, #fef5e7 100%);
  border-radius: 16rpx;
}

.test-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #e67e22;
  margin-bottom: 16rpx;
  display: block;
}

.code-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1rpx dashed rgba(230, 126, 34, 0.2);
}

.code-row:last-child {
  border-bottom: none;
}

.code-name {
  font-size: 24rpx;
  color: #555;
  font-weight: 500;
}

.code-value {
  font-size: 24rpx;
  color: #d35400;
  font-family: monospace;
}

.scanner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
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
  box-shadow: 0 0 60rpx rgba(211, 84, 0, 0.4);
}

.scanner-footer {
  margin-top: 60rpx;
}

.cancel-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
}

.cancel-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
</style>
