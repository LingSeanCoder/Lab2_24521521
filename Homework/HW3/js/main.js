import { createAntiDriftTimer } from './anti-drift-timer.js';
import { InventoryEngine } from './inventory-engine.js';

const timerDisplay = document.getElementById('countdown-timer');
const stockDisplay = document.getElementById('stock-display');
const buyBtn = document.getElementById('buy-btn');
const statusMsg = document.getElementById('status-msg');

const inventory = new InventoryEngine(5);
stockDisplay.textContent = inventory.stock;

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

createAntiDriftTimer(60000, (remaining) => {
  timerDisplay.textContent = formatTime(remaining);
  
  if (remaining === 0) {
    timerDisplay.textContent = "Hết giờ Flash Sale";
    buyBtn.disabled = true;
    statusMsg.textContent = "Phiên mua sắm đã kết thúc.";
    inventory.cancelLock();
  }
});

buyBtn.addEventListener('click', () => {
  const result = inventory.reserveItem();

  if (!result.success) {
    statusMsg.textContent = result.message;
    return;
  }

  buyBtn.disabled = true;
  statusMsg.textContent = 'Đang giữ hàng... Vui lòng chờ thanh toán.';

  setTimeout(() => {
    const checkoutResult = inventory.checkout();

    if (checkoutResult.success) {
      stockDisplay.textContent = checkoutResult.remainingStock;
      
      if (checkoutResult.remainingStock > 0) {
        statusMsg.textContent = 'Mua thành công! Bạn có thể mua tiếp.';
        buyBtn.disabled = false;
      } else {
        statusMsg.textContent = 'Mua thành công! Đã hết hàng.';
        buyBtn.disabled = true;
      }
    } else {
      statusMsg.textContent = 'Thanh toán thất bại.';
      buyBtn.disabled = false;
    }
  }, 2000);
});