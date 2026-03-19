<template>
  <view class="container">
    <view class="list-hero">
      <view class="hero-deco d1"></view>
      <view class="hero-deco d2"></view>
      <view class="snow-badge s1"></view>
      <view class="snow-badge s2"></view>
      <view class="hero-inner">
        <view class="hero-row">
          <view>
            <text class="hero-title">我的商品库</text>
            <text class="hero-count">共录入 {{ goodsList.length }} 件商品</text>
          </view>
          <view class="export-chip" @click="exportData">
            <text class="export-text">导出</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <view class="goods-item" v-for="(item, index) in goodsList" :key="item.barcode">
        <view class="item-index">
          <text class="index-num">{{ index + 1 }}</text>
        </view>
        <view class="item-img-wrap">
          <image class="item-img" :src="item.image || '/static/goods/nongfu.png'" mode="aspectFill"></image>
        </view>
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-code">{{ item.barcode }}</text>
          <text class="item-price">￥{{ item.price }}</text>
        </view>
      </view>

      <view v-if="goodsList.length === 0" class="empty-card">
        <text class="empty-title">商品库还是空的</text>
        <text class="empty-hint">去扫码录入第一件商品吧</text>
        <view class="empty-btn" @click="goScan">
          <text class="empty-btn-text">立即扫码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      goodsList: []
    }
  },
  onShow() {
    this.loadGoods();
  },
  methods: {
    loadGoods() {
      const customGoods = uni.getStorageSync('custom_goods') || {};
      this.goodsList = Object.keys(customGoods).map(code => ({
        barcode: code,
        ...customGoods[code]
      }));
    },
    goScan() {
      uni.switchTab({ url: '/pages/index/index' });
    },
    exportData() {
      if (this.goodsList.length === 0) {
        return uni.showToast({ title: '没有数据可导出', icon: 'none' });
      }
      let text = '【我的商品库清单】\n=======================\n';
      this.goodsList.forEach((item, i) => {
        text += `${i + 1}. 商品名称：${item.name}\n   条形码：${item.barcode}\n   价格：￥${item.price}\n-----------------------\n`;
      });
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: '清单已复制到剪贴板', icon: 'none' })
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background: linear-gradient(180deg, #f7e7d7 0%, #fff8f0 100%);
  min-height: 100vh;
}

.list-hero {
  position: relative;
  background: transparent;
  padding: 30rpx 30rpx 0;
  overflow: hidden;
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.snow-badge {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 241, 229, 0.4);
  background: rgba(255, 241, 229, 0.16);
}

.s1 {
  width: 34rpx;
  height: 34rpx;
  top: 72rpx;
  right: 170rpx;
}

.s2 {
  width: 18rpx;
  height: 18rpx;
  top: 132rpx;
  right: 118rpx;
}

.d1 {
  width: 200rpx;
  height: 200rpx;
  top: -60rpx;
  right: -40rpx;
}

.d2 {
  width: 150rpx;
  height: 150rpx;
  bottom: -30rpx;
  left: 60rpx;
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
}

.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(150deg, rgba(255, 251, 247, 0.9), rgba(248, 236, 222, 0.78));
  border: 1rpx solid rgba(236, 205, 173, 0.52);
  border-radius: 28rpx;
  padding: 24rpx 24rpx 22rpx;
  backdrop-filter: blur(8rpx);
  box-shadow:
    0 8rpx 24rpx rgba(103, 58, 29, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
}

.hero-title {
  font-size: 42rpx;
  font-weight: bold;
  color: #6e3820;
  display: block;
}

.hero-count {
  font-size: 24rpx;
  color: #9b7357;
  display: block;
  margin-top: 8rpx;
}

.export-chip {
  background: linear-gradient(135deg, #e1a367, #be6730);
  padding: 14rpx 28rpx;
  border-radius: 50rpx;
  border: 1rpx solid rgba(181, 93, 43, 0.16);
  box-shadow: 0 6rpx 16rpx rgba(190, 103, 48, 0.22);
}

.export-chip:active {
  background: linear-gradient(135deg, #e8ad74, #c46e37);
}

.export-text {
  font-size: 24rpx;
  color: #fffaf5;
  font-weight: 500;
}

.content {
  padding: 0 30rpx 40rpx;
  margin-top: 24rpx;
  position: relative;
  z-index: 5;
}

.goods-item {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.92), transparent 34%),
    linear-gradient(150deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94));
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(224, 190, 155, 0.38);
  box-shadow:
    0 10rpx 28rpx rgba(152, 104, 68, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
}

.goods-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18rpx;
  bottom: 18rpx;
  width: 10rpx;
  border-radius: 0 999rpx 999rpx 0;
  background: linear-gradient(180deg, #efc49d, #c7773d);
}

.item-index {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #e1a367 0%, #be6730 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18rpx;
  flex-shrink: 0;
}

.index-num {
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
}

.item-img-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 20rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.06);
}

.item-img {
  width: 100%;
  height: 100%;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.item-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-code {
  font-size: 22rpx;
  color: #a18066;
  font-family: monospace;
  margin-bottom: 8rpx;
}

.item-price {
  font-size: 32rpx;
  color: #b35f2e;
  font-weight: bold;
}

.empty-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.95), transparent 36%),
    linear-gradient(160deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94));
  border-radius: 30rpx;
  padding: 100rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1rpx solid rgba(224, 190, 155, 0.38);
  box-shadow:
    0 10rpx 28rpx rgba(152, 104, 68, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
  margin-top: 40rpx;
}


.empty-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #aaa;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #e1a367, #be6730);
  padding: 20rpx 50rpx;
  border-radius: 50rpx;
}

.empty-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>



