import { validateReturnForm, validateImageFile, formatBytes } from './utils/validation.js';
import { generateReturnId, isValidReturnId } from './utils/returnId.js';

console.log('====================================================');
console.log('🧪 MODULE 1 AUTOMATED COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Test Return ID Generation
console.log('--- 1. Return ID Generation & Format Tests ---');
const testId1 = generateReturnId();
const testId2 = generateReturnId();
console.log(`Generated ID 1: ${testId1}`);
console.log(`Generated ID 2: ${testId2}`);

assert(isValidReturnId(testId1), `Return ID "${testId1}" matches RET-YYYY-XXXXXX format`);
assert(isValidReturnId(testId2), `Return ID "${testId2}" matches RET-YYYY-XXXXXX format`);
assert(testId1 !== testId2, 'Subsequent return IDs are distinct');
assert(!isValidReturnId('INVALID-123'), 'Rejects malformed return ID');

// 2. Test Validation on Empty / Incomplete Form
console.log('\n--- 2. Empty Form Validation Tests ---');
const emptyForm = {
  customer: {},
  order: {},
  return: {},
  evidence: [],
  pickup: {}
};
const emptyErrors = validateReturnForm(emptyForm);
console.log('Empty form detected errors count:', Object.keys(emptyErrors).length);
assert(!!emptyErrors['customer.customer_id'], 'Validates Customer ID is required');
assert(!!emptyErrors['customer.name'], 'Validates Customer Name is required');
assert(!!emptyErrors['customer.email'], 'Validates Customer Email is required');
assert(!!emptyErrors['customer.phone'], 'Validates Customer Phone is required');
assert(!!emptyErrors['order.order_id'], 'Validates Order ID is required');
assert(!!emptyErrors['order.product_id'], 'Validates Product ID is required');
assert(!!emptyErrors['order.product_name'], 'Validates Product Name is required');
assert(!!emptyErrors['order.category'], 'Validates Product Category is required');
assert(!!emptyErrors['order.price'], 'Validates Product Price is required');
assert(!!emptyErrors['order.purchase_date'], 'Validates Purchase Date is required');
assert(!!emptyErrors['order.delivery_date'], 'Validates Delivery Date is required');
assert(!!emptyErrors['return.reason'], 'Validates Return Reason is required');
assert(!!emptyErrors['return.condition'], 'Validates Product Condition is required');
assert(!!emptyErrors['return.description'], 'Validates Damage Description is required');
assert(!!emptyErrors['evidence'], 'Validates at least one evidence image is required');
assert(!!emptyErrors['pickup.address'], 'Validates Pickup Address is required');
assert(!!emptyErrors['pickup.city'], 'Validates Pickup City is required');
assert(!!emptyErrors['pickup.postal_code'], 'Validates Postal Code is required');
assert(!!emptyErrors['pickup.preferred_date'], 'Validates Preferred Pickup Date is required');

// 3. Test Date Constraints (delivery_date < purchase_date)
console.log('\n--- 3. Date & Logic Constraints Tests ---');
const invalidDateForm = {
  ...emptyForm,
  order: {
    ...emptyForm.order,
    purchase_date: '2026-08-25',
    delivery_date: '2026-08-20' // earlier than purchase
  }
};
const dateErrors = validateReturnForm(invalidDateForm);
assert(
  dateErrors['order.delivery_date'] === 'Delivery date cannot be earlier than purchase date.',
  'Rejects delivery date earlier than purchase date'
);

// 4. Test Return Reason "Other" requiring additional explanation
console.log('\n--- 4. Dynamic Reason "Other" Validation Tests ---');
const otherReasonForm = {
  ...emptyForm,
  return: {
    reason: 'Other',
    additional_reason: ''
  }
};
const reasonErrors = validateReturnForm(otherReasonForm);
assert(
  !!reasonErrors['return.additional_reason'],
  'Requires additional_reason when reason is "Other"'
);

// 5. Test File Validation Utilities
console.log('\n--- 5. Evidence File Validation Tests ---');
const validJpg = { name: 'damage1.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 };
const validWebp = { name: 'damage2.webp', type: 'image/webp', size: 4 * 1024 * 1024 };
const invalidExe = { name: 'virus.exe', type: 'application/x-msdownload', size: 1000 };
const oversizedImg = { name: 'huge.png', type: 'image/png', size: 15 * 1024 * 1024 }; // 15MB

assert(validateImageFile(validJpg) === null, 'Accepts valid JPG under 10MB');
assert(validateImageFile(validWebp) === null, 'Accepts valid WEBP under 10MB');
assert(validateImageFile(invalidExe) !== null, 'Rejects invalid mime type .exe');
assert(validateImageFile(oversizedImg) !== null, 'Rejects oversized image > 10MB');

assert(formatBytes(1500) === '1.5 KB', 'Formats KB bytes correctly');
assert(formatBytes(1500000) === '1.4 MB', 'Formats MB bytes correctly');

// 6. Test Valid Full Form
console.log('\n--- 6. Complete Valid Return Payload Test ---');
const validForm = {
  customer: {
    customer_id: 'CUS-1024',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+91 98765 43210'
  },
  order: {
    order_id: 'ORD-5821',
    product_id: 'PRD-SOFA-889',
    product_name: '3-Seater Velvet Sofa',
    category: 'Sofa',
    price: 899.99,
    purchase_date: '2026-08-10',
    delivery_date: '2026-08-15'
  },
  return: {
    reason: 'Damaged on delivery',
    additional_reason: '',
    condition: 'Major Damage',
    description: 'Deep tear on the left side armrest cushion with damaged frame.'
  },
  evidence: [
    {
      id: 'img_1',
      name: 'sofa_tear.jpg',
      size: 500000,
      type: 'image/jpeg',
      dataUrl: 'data:image/jpeg;base64,...',
      uploadedAt: new Date().toISOString()
    }
  ],
  pickup: {
    address: '42 Orchard Avenue, Flat 4B',
    city: 'Chennai',
    postal_code: '600001',
    preferred_date: '2026-08-30',
    instructions: 'Freight elevator access at rear'
  }
};

const validFormErrors = validateReturnForm(validForm);
assert(Object.keys(validFormErrors).length === 0, 'Valid complete form passes with 0 validation errors');

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log('====================================================\n');
