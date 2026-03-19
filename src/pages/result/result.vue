<template>
  <view class="container">
    <!-- 渐变头部 -->
    <view class="result-hero">
      <view class="hero-deco d1"></view>
      <view class="hero-deco d2"></view>
      <view class="snow-badge s1"></view>
      <view class="snow-badge s2"></view>
      <view class="hero-inner">
        <text class="hero-back" @click="goBack">← 返回</text>
        <text class="hero-title">商品详情</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-box" v-if="loading">
      <text class="loading-emoji">🔍</text>
      <text class="loading-text">正在从商品库中查找...</text>
    </view>

    <view class="content" v-if="!loading">
      <!-- 找到商品 -->
      <view v-if="goodsInfo" class="goods-card">
        <view class="card-ribbon">
          <text class="ribbon-text">已录入</text>
        </view>
        <view class="img-wrapper">
          <image class="goods-img" :src="goodsInfo.image" mode="aspectFill"></image>
        </view>
        <text class="goods-name">{{ goodsInfo.name }}</text>
        <view class="price-row">
          <text class="price-symbol">￥</text>
          <text class="price-value">{{ goodsInfo.price }}</text>
        </view>
        <view class="barcode-badge">
          <text class="badge-label">📊 条码</text>
          <text class="badge-code">{{ scannedCode }}</text>
        </view>
      </view>

      <!-- 未找到 -->
      <view v-else class="not-found-card">
        <text class="nf-emoji">🔎</text>
        <text class="nf-title">仓库中尚未收录此商品</text>
        <view class="nf-code-box">
          <text class="nf-code">条码：{{ scannedCode }}</text>
        </view>
        <text class="nf-hint">点击下方按钮手动录入</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-area">
        <view v-if="!goodsInfo" class="action-btn primary-btn" @click="goManualEntry">
          <text class="action-icon">➕</text>
          <text class="action-text">手动录入此商品</text>
        </view>
        <view class="action-btn secondary-btn" :class="{ 'single-action': goodsInfo }" @click="goBack">
          <text class="action-icon">📷</text>
          <text class="action-text">返回继续扫码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      scannedCode: '',
      loading: true,
      goodsInfo: null,
      mockData: {
        '6921168511280': { name: '农夫山泉饮用天然水 550ml', price: '2.00', image: '/static/goods/nongfu.png' },
        '6925303711119': { name: '百事可乐 330ml 易拉罐', price: '2.50', image: '/static/goods/kele.png' },
        '6901285991219': { name: '怡宝纯净水', price: '2.00', image: '/static/goods/yibao.png' },
        '6914973604366': { name: '德芙丝滑牛奶巧克力 43g', price: '8.00', image: '/static/goods/defu.png' },
        '6902538004045': { name: '脉动维生素饮料', price: '5.00', image: '/static/goods/maidong.jpg' }
      }
    }
  },
  onLoad(options) {
    this.scannedCode = options.code;
  },
  onShow() {
    if (this.scannedCode) {
      this.queryGoodsInfo(this.scannedCode);
    }
  },
  methods: {
    queryGoodsInfo(code) {
      this.loading = true;
      const customGoods = uni.getStorageSync('custom_goods') || {};
      setTimeout(() => {
        this.loading = false;
        if (customGoods[code]) {
          this.goodsInfo = customGoods[code];
        } else if (this.mockData[code]) {
          this.goodsInfo = this.mockData[code];
        } else {
          this.goodsInfo = null;
        }
      }, 500);
    },
    goBack() {
      uni.navigateBack();
    },
    goManualEntry() {
      uni.navigateTo({ url: `/pages/edit/edit?code=${this.scannedCode}` });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f7e7d7 0%, #fff8f0 100%);
  min-height: 100vh;
}

.result-hero {
  position: relative;
  background: linear-gradient(135deg, #c9783e 0%, #9d4e29 100%);
  padding: 60rpx 40rpx 80rpx;
  border-radius: 0 0 50rpx 50rpx;
  overflow: hidden;
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.14);
}

.snow-badge {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid rgba(255,241,229,0.4);
  background: rgba(255,241,229,0.16);
}

.s1 {
  width: 34rpx;
  height: 34rpx;
  top: 74rpx;
  right: 158rpx;
}

.s2 {
  width: 18rpx;
  height: 18rpx;
  top: 128rpx;
  right: 108rpx;
}

.d1 { width: 200rpx; height: 200rpx; top: -40rpx; right: -30rpx; }
.d2 { width: 140rpx; height: 140rpx; bottom: -20rpx; left: 80rpx; }

.hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.hero-back {
  color: rgba(255,255,255,0.8);
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.hero-title {
  color: #fff;
  font-size: 44rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.loading-emoji {
  font-size: 80rpx;
  animation: bounce 1s ease-in-out infinite;
}

.loading-text {
  font-size: 28rpx;
  color: #a17b61;
  margin-top: 20rpx;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.content {
  padding: 0 30rpx 40rpx;
  margin-top: -30rpx;
  position: relative;
  z-index: 5;
}

.goods-card {
  background:
    radial-gradient(circle at top right, rgba(255,255,255,0.94), transparent 34%),
    linear-gradient(150deg, rgba(255,251,247,0.98), rgba(248,236,222,0.94));
  border-radius: 30rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1rpx solid rgba(224, 190, 155, 0.36);
  box-shadow:
    0 12rpx 34rpx rgba(152,104,68,0.12),
    inset 0 1rpx 0 rgba(255,255,255,0.9);
  position: relative;
  overflow: hidden;
}

.card-ribbon {
  position: absolute;
  top: 30rpx;
  right: -30rpx;
  background: linear-gradient(135deg, #e1a367, #be6730);
  padding: 8rpx 50rpx;
  transform: rotate(45deg);
}

.ribbon-text {
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
}

.img-wrapper {
  width: 400rpx;
  height: 400rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.1);
  margin-bottom: 30rpx;
}

.goods-img {
  width: 100%;
  height: 100%;
}

.goods-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 16rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.price-symbol {
  font-size: 36rpx;
  color: #b35f2e;
  font-weight: bold;
}

.price-value {
  font-size: 64rpx;
  color: #b35f2e;
  font-weight: bold;
  font-family: 'DIN Alternate', monospace;
}

.barcode-badge {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #fff6ee, #f8eadc);
  padding: 16rpx 30rpx;
  border-radius: 50rpx;
}

.badge-label {
  font-size: 24rpx;
  color: #c5763c;
}

.badge-code {
  font-size: 24rpx;
  color: #a45a2f;
  font-family: monospace;
  font-weight: bold;
}

.not-found-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255,255,255,0.95), transparent 36%),
    linear-gradient(160deg, rgba(255,251,247,0.98), rgba(248,236,222,0.94));
  border-radius: 30rpx;
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1rpx solid rgba(224, 190, 155, 0.36);
  box-shadow:
    0 12rpx 34rpx rgba(152,104,68,0.12),
    inset 0 1rpx 0 rgba(255,255,255,0.9);
}

.nf-emoji {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.nf-title {
  font-size: 34rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.nf-code-box {
  background: linear-gradient(180deg, #fff6ee, #f8eadc);
  padding: 14rpx 30rpx;
  border-radius: 30rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(224, 190, 155, 0.34);
}

.nf-code {
  font-size: 24rpx;
  color: #999;
  font-family: monospace;
}

.nf-hint {
  font-size: 24rpx;
  color: #bbb;
}

.action-area {
  margin-top: 40rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  height: 100rpx;
  border-radius: 50rpx;
  margin-bottom: 24rpx;
}

.action-btn:active {
  transform: scale(0.97);
}

.primary-btn {
  background: linear-gradient(135deg, #e1a367 0%, #be6730 100%);
  box-shadow: 0 8rpx 25rpx rgba(190, 103, 48, 0.26);
}

.primary-btn .action-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

.primary-btn .action-icon {
  font-size: 34rpx;
}

.secondary-btn {
  background: rgba(255,255,255,0.92);
  border: 2rpx solid rgba(224, 190, 155, 0.62);
}

.secondary-btn .action-text {
  color: #666;
  font-size: 28rpx;
}

.secondary-btn .action-icon {
  font-size: 30rpx;
}

.single-action {
  margin-bottom: 0;
}
</style>

