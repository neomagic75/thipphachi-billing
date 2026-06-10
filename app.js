// ================= STATE MANAGEMENT =================
let appMode = 'utility'; // 'utility' or 'moveout'
let damageItems = [];
let photoStore = {
  elec: null,
  water: null
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  // Set current date in receipt
  const today = new Date();
  const formattedDate = today.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('preview-date').textContent = `Date: ${formattedDate}`;

  // Add Room Change event listeners to trigger historical data load
  document.getElementById('room-num').addEventListener('change', (e) => loadHistoricalRoomData(e.target.value));
  
  // Sync initial view
  syncPreview();
});

// ================= TAB SWITCHING =================
function switchMode(mode) {
  appMode = mode;
  
  // Toggle tab buttons
  document.getElementById('tab-utility').classList.toggle('active', mode === 'utility');
  document.getElementById('tab-moveout').classList.toggle('active', mode === 'moveout');
  
  // Toggle form panels
  document.getElementById('form-utility').classList.toggle('hidden', mode !== 'utility');
  document.getElementById('form-moveout').classList.toggle('hidden', mode !== 'moveout');
  
  // Toggle receipt preview tables
  document.getElementById('preview-utility-table').classList.toggle('hidden', mode !== 'utility');
  document.getElementById('preview-moveout-table').classList.toggle('hidden', mode !== 'moveout');
  
  // Update receipt title
  const titleText = mode === 'utility' ? 'ใบแจ้งหนี้ค่าเช่าและสาธารณูปโภค' : 'ใบสรุปการย้ายออกและคืนเงินประกัน';
  document.getElementById('preview-title').textContent = titleText;
  
  syncPreview();
}

// ================= PHOTO HANDLING =================
function handlePhoto(input, type) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64Data = e.target.result;
    
    // Store in state
    photoStore[type] = base64Data;
    
    // Show thumbnail in form
    const container = document.getElementById(`${type}-preview-container`);
    const img = document.getElementById(`${type}-thumb`);
    img.src = base64Data;
    container.classList.remove('hidden');
    
    // Set in print preview
    const printImg = document.getElementById(`print-img-${type}`);
    const printBox = document.getElementById(`print-photo-${type}`);
    printImg.src = base64Data;
    printBox.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function removePhoto(type) {
  photoStore[type] = null;
  
  // Clear file input
  document.getElementById(`${type}-photo`).value = '';
  
  // Hide form thumbnail
  const container = document.getElementById(`${type}-preview-container`);
  container.classList.add('hidden');
  document.getElementById(`${type}-thumb`).src = '';
  
  // Hide print preview photo
  const printBox = document.getElementById(`print-photo-${type}`);
  printBox.classList.add('hidden');
  document.getElementById(`print-img-${type}`).src = '';
}

// ================= DYNAMIC DAMAGE ITEMS =================
function addDamageItem() {
  const id = Date.now().toString();
  const item = {
    id: id,
    description: '',
    cost: 0,
    photo: null
  };
  
  damageItems.push(item);
  renderDamageFormItem(item);
  syncPreview();
}

function renderDamageFormItem(item) {
  const container = document.getElementById('damage-list-container');
  
  const row = document.createElement('div');
  row.className = 'damage-item-row';
  row.id = `damage-row-${item.id}`;
  row.innerHTML = `
    <div class="damage-item-inputs">
      <input type="text" placeholder="Description (e.g., Broken Door Lock)" oninput="updateDamageItem('${item.id}', 'description', this.value)">
      <input type="number" placeholder="Cost" oninput="updateDamageItem('${item.id}', 'cost', this.value)">
      <button class="delete-damage-btn" onclick="removeDamageItem('${item.id}')">×</button>
    </div>
    <div class="photo-upload">
      <label class="photo-btn" id="lbl-damage-${item.id}">
        📸 Attach Photo of Damage
        <input type="file" accept="image/*" capture="environment" onchange="handleDamagePhoto(this, '${item.id}')">
      </label>
      <div id="damage-preview-${item.id}" class="thumbnail-preview hidden">
        <img id="damage-thumb-${item.id}" src="" alt="Damage preview">
        <button type="button" class="remove-photo" onclick="removeDamagePhoto('${item.id}')">×</button>
      </div>
    </div>
  `;
  container.appendChild(row);
}

function updateDamageItem(id, field, value) {
  const item = damageItems.find(i => i.id === id);
  if (!item) return;
  
  if (field === 'cost') {
    item.cost = parseFloat(value) || 0;
  } else {
    item.description = value;
  }
  syncPreview();
}

function removeDamageItem(id) {
  damageItems = damageItems.filter(i => i.id !== id);
  const el = document.getElementById(`damage-row-${id}`);
  if (el) el.remove();
  syncPreview();
}

function handleDamagePhoto(input, id) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    
    // Store in state
    const item = damageItems.find(i => i.id === id);
    if (item) item.photo = base64Data;
    
    // Display thumbnail in form
    const container = document.getElementById(`damage-preview-${id}`);
    const img = document.getElementById(`damage-thumb-${id}`);
    img.src = base64Data;
    container.classList.remove('hidden');
    
    syncPreview();
  };
  reader.readAsDataURL(file);
}

function removeDamagePhoto(id) {
  const item = damageItems.find(i => i.id === id);
  if (item) item.photo = null;
  
  // Clear inputs and thumbnails
  const container = document.getElementById(`damage-preview-${id}`);
  container.classList.add('hidden');
  document.getElementById(`damage-thumb-${id}`).src = '';
  
  syncPreview();
}

// ================= CALCULATION & PREVIEW SYNC =================
function syncPreview() {
  if (appMode === 'utility') {
    syncUtilityPreview();
  } else {
    syncMoveoutPreview();
  }
}

function syncUtilityPreview() {
  // Inputs
  const room = document.getElementById('room-num').value || '-';
  const tenant = document.getElementById('tenant-name').value || '-';
  
  const baseRent = parseFloat(document.getElementById('base-rent').value) || 0;
  const wifiFee = parseFloat(document.getElementById('wifi-fee').value) || 0;
  const otherFee = parseFloat(document.getElementById('other-fee').value) || 0;
  
  const elecRate = parseFloat(document.getElementById('elec-rate').value) || 7;
  const elecPrev = parseFloat(document.getElementById('elec-prev').value) || 0;
  const elecCurr = parseFloat(document.getElementById('elec-curr').value) || 0;
  
  const waterRate = parseFloat(document.getElementById('water-rate').value) || 18;
  const waterPrev = parseFloat(document.getElementById('water-prev').value) || 0;
  const waterCurr = parseFloat(document.getElementById('water-curr').value) || 0;
  
  // Math
  const elecUnits = Math.max(0, elecCurr - elecPrev);
  const elecCost = elecUnits * elecRate;
  
  const waterUnits = Math.max(0, waterCurr - waterPrev);
  const waterCost = waterUnits * waterRate;
  
  const grandTotal = baseRent + wifiFee + otherFee + elecCost + waterCost;

  // Render text values
  document.getElementById('prev-room-val').textContent = room;
  document.getElementById('prev-tenant-val').textContent = tenant;
  
  document.getElementById('prev-rent-cost').textContent = formatBaht(baseRent);
  document.getElementById('prev-wifi-cost').textContent = formatBaht(wifiFee);
  
  // Other / Late Fee Row
  const otherRow = document.getElementById('prev-other-row');
  if (otherFee > 0) {
    otherRow.classList.remove('hidden');
    document.getElementById('prev-other-cost').textContent = formatBaht(otherFee);
  } else {
    otherRow.classList.add('hidden');
  }

  // Electricity
  document.getElementById('prev-elec-readings').textContent = `${elecPrev} - ${elecCurr}`;
  document.getElementById('prev-elec-units').textContent = elecUnits.toLocaleString();
  document.getElementById('prev-elec-rate').textContent = `฿${elecRate.toFixed(2)}`;
  document.getElementById('prev-elec-cost').textContent = formatBaht(elecCost);
  
  // Water
  document.getElementById('prev-water-readings').textContent = `${waterPrev} - ${waterCurr}`;
  document.getElementById('prev-water-units').textContent = waterUnits.toLocaleString();
  document.getElementById('prev-water-rate').textContent = `฿${waterRate.toFixed(2)}`;
  document.getElementById('prev-water-cost').textContent = formatBaht(waterCost);
  
  // Grand Total
  document.getElementById('grand-total-label').textContent = 'Grand Total / ยอดชำระสุทธิ:';
  document.getElementById('prev-grand-total').textContent = formatBaht(grandTotal);
  document.getElementById('prev-grand-total').classList.remove('text-success', 'text-danger');
  
  // Show standard bank instructions
  document.getElementById('payment-instructions-block').classList.remove('hidden');
}

function syncMoveoutPreview() {
  // Inputs
  const room = document.getElementById('mo-room-num').value || '-';
  const tenant = document.getElementById('mo-tenant-name').value || '-';
  const deposit = parseFloat(document.getElementById('mo-deposit').value) || 0;
  const unpaidRent = parseFloat(document.getElementById('mo-unpaid-rent').value) || 0;
  const unpaidUtils = parseFloat(document.getElementById('mo-unpaid-utils').value) || 0;
  
  // Render Metadata
  document.getElementById('prev-room-val').textContent = room;
  document.getElementById('prev-tenant-val').textContent = tenant;
  
  // Render Base Deposit & Unpaid rows
  document.getElementById('prev-mo-deposit').textContent = `-${formatBaht(deposit)}`;
  
  const rentRow = document.getElementById('prev-mo-rent-row');
  if (unpaidRent > 0) {
    rentRow.classList.remove('hidden');
    document.getElementById('prev-mo-unpaid-rent').textContent = formatBaht(unpaidRent);
  } else {
    rentRow.classList.add('hidden');
  }
  
  const utilsRow = document.getElementById('prev-mo-utils-row');
  if (unpaidUtils > 0) {
    utilsRow.classList.remove('hidden');
    document.getElementById('prev-mo-unpaid-utils').textContent = formatBaht(unpaidUtils);
  } else {
    utilsRow.classList.add('hidden');
  }

  // Render Damage Rows
  const tbody = document.getElementById('prev-damage-rows');
  tbody.innerHTML = '';
  
  const printGallery = document.getElementById('print-damage-gallery');
  printGallery.innerHTML = '';
  let hasPhotosToPrint = false;

  let totalDamages = 0;
  
  damageItems.forEach((item, index) => {
    totalDamages += item.cost;
    
    // Create Table Row
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}. ${item.description || 'Damage Item'}</td>
      <td class="text-right">${item.photo ? '📸 Attached' : 'No Photo'}</td>
      <td class="text-right text-danger">${formatBaht(item.cost)}</td>
    `;
    tbody.appendChild(tr);
    
    // Add to Print Gallery if photo exists
    if (item.photo) {
      hasPhotosToPrint = true;
      const card = document.createElement('div');
      card.className = 'print-damage-card';
      card.innerHTML = `
        <p class="photo-title">ความเสียหายที่ ${index + 1}: ${item.description || 'Damage Item'}</p>
        <p class="photo-title">ราคาประเมินค่าซ่อม: ${formatBaht(item.cost)}</p>
        <img src="${item.photo}" alt="Damage ${index + 1}">
      `;
      printGallery.appendChild(card);
    }
  });
  
  // Show/Hide Print Gallery container
  printGallery.classList.toggle('hidden', !hasPhotosToPrint);
  document.getElementById('print-damage-gallery').classList.toggle('hidden', !hasPhotosToPrint);

  // Final Net Calculation
  const netDue = (totalDamages + unpaidRent + unpaidUtils) - deposit;
  const grandTotalEl = document.getElementById('prev-grand-total');
  const labelEl = document.getElementById('grand-total-label');
  
  if (netDue < 0) {
    // Refund to tenant
    labelEl.textContent = 'Refund to Tenant / ยอดเงินคืนผู้เช่า:';
    grandTotalEl.textContent = formatBaht(Math.abs(netDue));
    grandTotalEl.className = 'total-val text-success';
  } else {
    // Tenant owes landlord
    labelEl.textContent = 'Balance Due / ยอดเรียกเก็บเพิ่ม:';
    grandTotalEl.textContent = formatBaht(netDue);
    grandTotalEl.className = 'total-val text-danger';
  }
  
  // Hide payment instructions if refunding, show if tenant owes money
  const paymentInstructionsBlock = document.getElementById('payment-instructions-block');
  if (netDue <= 0) {
    paymentInstructionsBlock.classList.add('hidden');
  } else {
    paymentInstructionsBlock.classList.remove('hidden');
  }
}

// ================= UTILITIES =================
function formatBaht(value) {
  return '฿' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ================= LOCAL STORAGE PERSISTENCE (QoL Feature) =================
function saveCurrentReadings() {
  const room = document.getElementById('room-num').value.trim();
  if (!room) return;

  const data = {
    elec: parseFloat(document.getElementById('elec-curr').value) || 0,
    water: parseFloat(document.getElementById('water-curr').value) || 0,
    tenant: document.getElementById('tenant-name').value.trim(),
    timestamp: Date.now()
  };

  localStorage.setItem(`thipphachi_room_${room}`, JSON.stringify(data));
}

function loadHistoricalRoomData(room) {
  if (!room) return;
  const savedData = localStorage.getItem(`thipphachi_room_${room}`);
  
  if (savedData) {
    const data = JSON.parse(savedData);
    
    // Auto populate the PREVIOUS fields with the historical CURRENT readings
    document.getElementById('elec-prev').value = data.elec || 0;
    document.getElementById('water-prev').value = data.water || 0;
    document.getElementById('tenant-name').value = data.tenant || '';
    
    // Reset current fields to zero for new entry
    document.getElementById('elec-curr').value = 0;
    document.getElementById('water-curr').value = 0;
    
    // Re-sync
    syncPreview();
    
    // Quick notification banner in console/log for debugging
    console.log(`Loaded historical reading for Room ${room}: Elec ${data.elec}, Water ${data.water}`);
  }
}

// ================= PRINT TRIGGER =================
function printReceipt() {
  // If in utility mode, save current readings as NEXT month's previous readings
  if (appMode === 'utility') {
    saveCurrentReadings();
  }
  
  window.print();
}
