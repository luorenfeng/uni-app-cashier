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
            <text class="hero-title">{{ text.title }}</text>
            <text class="hero-count">{{ text.countPrefix }} {{ goodsList.length }} {{ text.countSuffix }}</text>
          </view>
          <view class="export-chip" @click="exportData">
            <text class="export-text">{{ text.export }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <view v-if="goodsList.length > 0" class="list-columns">
        <text class="col-name">商品信息</text>
        <text class="col-price">价格</text>
      </view>

      <view class="goods-item" v-for="item in goodsList" :key="item.barcode" @click="openGoodsEditor(item.barcode)">
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-code">{{ item.barcode }}</text>
        </view>
        <view class="item-price-box">
          <text class="item-price">{{ text.priceSymbol }}{{ item.price }}</text>
        </view>
      </view>

      <view v-if="goodsList.length === 0" class="empty-card">
        <text class="empty-title">{{ text.emptyTitle }}</text>
        <text class="empty-hint">{{ text.emptyHint }}</text>
        <view class="empty-btn" @click="goScan">
          <text class="empty-btn-text">{{ text.scanNow }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getCustomGoodsList } from '../../utils/goods-store';

const text = Object.freeze({
  title: '我的商品库',
  countPrefix: '共录入',
  countSuffix: '件商品',
  export: '导出',
  priceSymbol: '￥',
  emptyTitle: '商品库还是空的',
  emptyHint: '去扫码录入第一件商品吧',
  scanNow: '立即扫码',
  readFailed: '商品库读取失败',
  noData: '没有数据可导出',
  clipboardDone: '清单已复制到剪贴板',
  exportTitle: '【我的商品库清单】',
  itemName: '商品名称：',
  itemBarcode: '条形码：',
  itemPrice: '价格：￥'
});

const goodsList = ref([]);

onShow(() => {
  void loadGoods();
});

async function loadGoods() {
  try {
    goodsList.value = await getCustomGoodsList();
  } catch (error) {
    goodsList.value = [];
    uni.showToast({ title: text.readFailed, icon: 'none' });
  }
}

function goScan() {
  uni.switchTab({ url: '/pages/index/index' });
}

function openGoodsEditor(barcode) {
  uni.navigateTo({
    url: `/pages/edit/edit?code=${encodeURIComponent(barcode)}`
  });
}

function exportData() {
  if (goodsList.value.length === 0) {
    return uni.showToast({ title: text.noData, icon: 'none' });
  }

  let exportText = `${text.exportTitle}\n=======================\n`;

  goodsList.value.forEach((item, index) => {
    exportText += `${index + 1}. ${text.itemName}${item.name}\n   ${text.itemBarcode}${item.barcode}\n   ${text.itemPrice}${item.price}\n-----------------------\n`;
  });

  uni.setClipboardData({
    data: exportText,
    success: () => uni.showToast({ title: text.clipboardDone, icon: 'none' })
  });
}
</script>

<style lang="scss" scoped>
.container { background: linear-gradient(180deg, #f7e7d7 0%, #fff8f0 100%); min-height: 100vh; }
.list-hero { position: relative; background: transparent; padding: 30rpx 30rpx 0; overflow: hidden; }
.hero-deco { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.14); }
.snow-badge { position: absolute; border-radius: 50%; border: 2rpx solid rgba(255, 241, 229, 0.4); background: rgba(255, 241, 229, 0.16); }
.s1 { width: 34rpx; height: 34rpx; top: 72rpx; right: 170rpx; }
.s2 { width: 18rpx; height: 18rpx; top: 132rpx; right: 118rpx; }
.d1 { width: 200rpx; height: 200rpx; top: -60rpx; right: -40rpx; }
.d2 { width: 150rpx; height: 150rpx; bottom: -30rpx; left: 60rpx; }
.hero-inner { position: relative; z-index: 2; width: 100%; }
.hero-row { display: flex; justify-content: space-between; align-items: center; width: 100%; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.9), transparent 34%), linear-gradient(150deg, rgba(255, 251, 247, 0.9), rgba(248, 236, 222, 0.78)); border: 1rpx solid rgba(236, 205, 173, 0.52); border-radius: 28rpx; padding: 24rpx 24rpx 22rpx; backdrop-filter: blur(8rpx); box-shadow: 0 8rpx 24rpx rgba(103, 58, 29, 0.12), inset 0 1rpx 0 rgba(255, 255, 255, 0.72); }
.hero-title { font-size: 42rpx; font-weight: bold; color: #6e3820; display: block; }
.hero-count { font-size: 24rpx; color: #9b7357; display: block; margin-top: 8rpx; }
.export-chip { background: linear-gradient(135deg, #e1a367, #be6730); padding: 14rpx 28rpx; border-radius: 50rpx; border: 1rpx solid rgba(181, 93, 43, 0.16); box-shadow: 0 6rpx 16rpx rgba(190, 103, 48, 0.22); }
.export-chip:active { background: linear-gradient(135deg, #e8ad74, #c46e37); }
.export-text { font-size: 24rpx; color: #fffaf5; font-weight: 500; }
.content { padding: 0 30rpx 40rpx; margin-top: 24rpx; position: relative; z-index: 5; }
.list-columns { display: flex; align-items: center; padding: 0 28rpx; margin-bottom: 16rpx; color: #a07b61; font-size: 22rpx; }
.col-name { flex: 1; min-width: 0; }
.col-price { width: 160rpx; flex-shrink: 0; text-align: right; }
.goods-item { position: relative; overflow: hidden; display: flex; align-items: center; gap: 22rpx; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.92), transparent 34%), linear-gradient(150deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94)); border-radius: 24rpx; padding: 26rpx 28rpx; margin-bottom: 18rpx; border: 1rpx solid rgba(224, 190, 155, 0.38); box-shadow: 0 10rpx 28rpx rgba(152, 104, 68, 0.1), inset 0 1rpx 0 rgba(255, 255, 255, 0.88); }
.goods-item:active { transform: scale(0.988); }
.goods-item::before { content: ''; position: absolute; left: 0; top: 18rpx; bottom: 18rpx; width: 10rpx; border-radius: 0 999rpx 999rpx 0; background: linear-gradient(180deg, #efc49d, #c7773d); }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 30rpx; font-weight: 700; color: #4f321f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-code { display: block; margin-top: 8rpx; font-size: 21rpx; color: #a18066; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-price-box { width: 160rpx; flex-shrink: 0; display: flex; justify-content: flex-end; }
.item-price { display: inline-flex; align-items: center; justify-content: center; min-width: 132rpx; padding: 14rpx 18rpx; border-radius: 999rpx; background: linear-gradient(135deg, #fff3e7, #f5ddc6); color: #b35f2e; font-size: 30rpx; font-weight: 700; box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.85); }
.empty-card { position: relative; overflow: hidden; background: radial-gradient(circle at top, rgba(255, 255, 255, 0.95), transparent 36%), linear-gradient(160deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94)); border-radius: 30rpx; padding: 100rpx 40rpx; display: flex; flex-direction: column; align-items: center; border: 1rpx solid rgba(224, 190, 155, 0.38); box-shadow: 0 10rpx 28rpx rgba(152, 104, 68, 0.1), inset 0 1rpx 0 rgba(255, 255, 255, 0.88); margin-top: 40rpx; }
.empty-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; }
.empty-hint { font-size: 24rpx; color: #aaa; margin-bottom: 40rpx; }
.empty-btn { background: linear-gradient(135deg, #e1a367, #be6730); padding: 20rpx 50rpx; border-radius: 50rpx; }
.empty-btn-text { color: #fff; font-size: 28rpx; font-weight: bold; }
</style>
