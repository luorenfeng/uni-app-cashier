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
          <image class="item-img" :src="item.image || '/static/logo.png'" mode="aspectFill"></image>
        </view>
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-code">{{ item.barcode }}</text>
          <text class="item-price">￥{{ item.price }}</text>
        </view>
      </view>

      <view v-if="goodsList.length === 0" class="empty-card">
        <text class="empty-emoji">空</text>
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
  background: linear-gradient(180deg, #eef6ff 0%, #f7fbff 100%);
  min-height: 100vh;
}

.list-hero {
  position: relative;
  background: linear-gradient(135deg, #7ea7d1 0%, #5c81aa 100%);
  padding: 60rpx 40rpx 80rpx;
  border-radius: 0 0 50rpx 50rpx;
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
  border: 2rpx solid rgba(255, 255, 255, 0.36);
  background: rgba(255, 255, 255, 0.14);
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
}

.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-title {
  font-size: 42rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.hero-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
  display: block;
  margin-top: 8rpx;
}

.export-chip {
  background: rgba(255, 255, 255, 0.22);
  padding: 14rpx 28rpx;
  border-radius: 50rpx;
}

.export-chip:active {
  background: rgba(255, 255, 255, 0.35);
}

.export-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.content {
  padding: 0 30rpx 40rpx;
  margin-top: -30rpx;
  position: relative;
  z-index: 5;
}

.goods-item {
  display: flex;
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 249, 255, 0.96));
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(183, 208, 232, 0.4);
  box-shadow: 0 8rpx 24rpx rgba(109, 145, 184, 0.1);
}

.item-index {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #9cc2e8 0%, #5f88b8 100%);
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
  color: #8aa1b7;
  font-family: monospace;
  margin-bottom: 8rpx;
}

.item-price {
  font-size: 32rpx;
  color: #4f7baa;
  font-weight: bold;
}

.empty-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 249, 255, 0.96));
  border-radius: 30rpx;
  padding: 100rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1rpx solid rgba(183, 208, 232, 0.4);
  box-shadow: 0 8rpx 24rpx rgba(109, 145, 184, 0.1);
  margin-top: 40rpx;
}

.empty-emoji {
  font-size: 60rpx;
  margin-bottom: 30rpx;
  color: #6b93bd;
  font-weight: bold;
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
  background: linear-gradient(135deg, #9cc2e8, #5f88b8);
  padding: 20rpx 50rpx;
  border-radius: 50rpx;
}

.empty-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
