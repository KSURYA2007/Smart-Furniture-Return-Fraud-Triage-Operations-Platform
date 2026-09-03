/**
 * Demo Dataset for Module 6: Pickup Prioritisation & Operations Decision Engine
 * Implements Cases A through I defined in Section 41 of the specifications:
 * 
 * Case A: Low fraud risk + strong evidence + overdue pickup (Customer Service Urgency)
 * Case B: High fraud risk + human approved + recent return
 * Case C: Critical risk + human approved + high financial exposure
 * Case D: Rejected return (Excluded from pickup)
 * Case E: Request more evidence (Pending customer photos)
 * Case F: Escalated case (Operationally blocked)
 * Case G: Approved return with missing location
 * Case H: Approved return with missing order value
 * Case I: Clustered pickups in the same area for prototype route grouping
 */

export const DEMO_PICKUP_RETURNS = [
  // ─── Case A: Low Fraud Risk + Strong Evidence + Overdue Pickup (Service Urgency) ───
  {
    return_id: 'RET-2024-003001',
    order_id: 'ORD-2024-3001',
    customer_id: 'CUS-1025',
    customer_name: 'Priya Sharma',
    product: 'Nordic Oak 6-Seater Dining Table',
    category: 'Table',
    reason: 'Damaged on delivery',
    condition: 'Corner impact split during courier handling',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(), // 9 days ago
    order: {
      order_id: 'ORD-2024-3001',
      product_name: 'Nordic Oak 6-Seater Dining Table',
      price: 34500,
      delivery_date: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0],
      purchase_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: 'Plot 42, 12th Main Road, HAL 2nd Stage',
      city: 'Bengaluru',
      postal_code: '560008',
      area_cluster: 'BLR-EAST',
      preferred_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      instructions: 'Gate 2 entrance. Call 15 mins before arrival.',
      distance_km: 6.2
    },
    evidence: [
      {
        id: 'ev-3001-1',
        name: 'table_corner_split.jpg',
        size: 2100000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case B: High Fraud Risk + Human Approved + Recent Return ───
  {
    return_id: 'RET-2024-003002',
    order_id: 'ORD-2024-3002',
    customer_id: 'CUS-1024',
    customer_name: 'John Smith',
    product: 'Ergonomic Executive High-Back Chair',
    category: 'Chair',
    reason: 'Defective mechanism',
    condition: 'Hydraulic cylinder failed to lock elevation',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
    order: {
      order_id: 'ORD-2024-3002',
      product_name: 'Ergonomic Executive High-Back Chair',
      price: 18500,
      delivery_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      purchase_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: 'Flat 402, Sunset Towers, 100ft Road, Indiranagar',
      city: 'Bengaluru',
      postal_code: '560038',
      area_cluster: 'BLR-EAST',
      preferred_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      instructions: 'Service elevator available. Security badge required.',
      distance_km: 7.8
    },
    evidence: [
      {
        id: 'ev-3002-1',
        name: 'chair_piston_failure.jpg',
        size: 1800000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1580481077195-7798835824c0?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case C: Critical Risk + Human Approved + High Financial Exposure (₹85,000) ───
  {
    return_id: 'RET-2024-003003',
    order_id: 'ORD-2024-3003',
    customer_id: 'CUS-1026',
    customer_name: 'Arjun Nambiar',
    product: 'Italian Full-Grain L-Shaped Leather Sectional Sofa',
    category: 'Sofa',
    reason: 'Damaged on delivery',
    condition: 'Leather tear across left chaise cushion',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(), // 6 days ago
    order: {
      order_id: 'ORD-2024-3003',
      product_name: 'Italian Full-Grain L-Shaped Leather Sectional Sofa',
      price: 85000,
      delivery_date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      purchase_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: 'Villa 12, Palm Meadows Boulevard, Whitefield',
      city: 'Bengaluru',
      postal_code: '560066',
      area_cluster: 'BLR-TECH',
      preferred_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      instructions: 'Heavy bulky 2-piece item. Two-person crew required.',
      distance_km: 19.5
    },
    evidence: [
      {
        id: 'ev-3003-1',
        name: 'leather_sofa_tear.jpg',
        size: 3200000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case D: Rejected Return (Excluded from Pickup Scheduling) ───
  {
    return_id: 'RET-2024-003004',
    order_id: 'ORD-2024-3004',
    customer_id: 'CUS-1027',
    customer_name: 'Vikram Mehta',
    product: 'Velvet Recliner Armchair with Footstool',
    category: 'Chair',
    reason: 'Damaged on delivery',
    condition: 'Claimed torn velvet upholstery',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    order: {
      order_id: 'ORD-2024-3004',
      product_name: 'Velvet Recliner Armchair with Footstool',
      price: 24000,
      delivery_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: 'B-201, Raheja Residency, Koramangala 3rd Block',
      city: 'Bengaluru',
      postal_code: '560034',
      area_cluster: 'BLR-SOUTH',
      distance_km: 9.2
    },
    evidence: [
      {
        id: 'ev-3004-1',
        name: 'worn_chair.jpg',
        size: 1400000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case E: Request More Evidence (Pending Customer Submission) ───
  {
    return_id: 'RET-2024-003005',
    order_id: 'ORD-2024-3005',
    customer_id: 'CUS-1028',
    customer_name: 'Meera Deshmukh',
    product: 'King Size Sheesham Bed Frame with Storage',
    category: 'Bed',
    reason: 'Defective mechanism',
    condition: 'Hydraulic lift storage strut detached',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    order: {
      order_id: 'ORD-2024-3005',
      product_name: 'King Size Sheesham Bed Frame with Storage',
      price: 48000,
      delivery_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: 'Flat 1104, Prestige South Ridge, Jayanagar',
      city: 'Bengaluru',
      postal_code: '560041',
      area_cluster: 'BLR-CENTRAL',
      distance_km: 12.0
    },
    evidence: []
  },

  // ─── Case F: Escalated Case (Operationally Blocked) ───
  {
    return_id: 'RET-2024-003006',
    order_id: 'ORD-2024-3006',
    customer_id: 'CUS-1029',
    customer_name: 'Rajesh Nair',
    product: 'Hand-Carved Rosewood 8-Seater Dining Set',
    category: 'Table',
    reason: 'Missing parts / accessories',
    condition: 'Reported 4 missing chairs and scratched tabletop',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    order: {
      order_id: 'ORD-2024-3006',
      product_name: 'Hand-Carved Rosewood 8-Seater Dining Set',
      price: 72000,
      delivery_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: 'House 88, 5th Cross, RMV 2nd Stage, Hebbal',
      city: 'Bengaluru',
      postal_code: '560094',
      area_cluster: 'BLR-NORTH',
      distance_km: 21.0
    },
    evidence: [
      {
        id: 'ev-3006-1',
        name: 'delivery_slip.jpg',
        size: 1900000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case G: Approved Return with Missing Location (Edge Case 1) ───
  {
    return_id: 'RET-2024-003007',
    order_id: 'ORD-2024-3007',
    customer_id: 'CUS-1030',
    customer_name: 'Kavita Rao',
    product: 'Minimalist Floating Wall Bookshelf Unit',
    category: 'Storage',
    reason: 'Damaged on delivery',
    condition: 'Shattered glass door panel',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    order: {
      order_id: 'ORD-2024-3007',
      product_name: 'Minimalist Floating Wall Bookshelf Unit',
      price: 14500,
      delivery_date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0]
    },
    pickup: null, // MISSING LOCATION OBJECT
    evidence: [
      {
        id: 'ev-3007-1',
        name: 'broken_glass_shelf.jpg',
        size: 1600000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case H: Approved Return with Missing Order Value (Edge Case 2) ───
  {
    return_id: 'RET-2024-003008',
    order_id: 'ORD-2024-3008',
    customer_id: 'CUS-1031',
    customer_name: 'Suresh Patil',
    product: 'Modular Upholstered Ottoman Footstool',
    category: 'Sofa',
    reason: 'Defective mechanism',
    condition: 'Frame joint loose upon unboxing',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    order: {
      order_id: 'ORD-2024-3008',
      product_name: 'Modular Upholstered Ottoman Footstool',
      price: null // MISSING ORDER PRICE
    },
    pickup: {
      address: 'Block C-303, Alpine Eco Apartments, Marathahalli',
      city: 'Bengaluru',
      postal_code: '560037',
      area_cluster: 'BLR-TECH',
      distance_km: 16.8
    },
    evidence: [
      {
        id: 'ev-3008-1',
        name: 'ottoman_joint.jpg',
        size: 1500000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=60'
      }
    ]
  },

  // ─── Case I: Clustered Pickups in the Same Area for Route Grouping (BLR-EAST) ───
  {
    return_id: 'RET-2024-003009',
    order_id: 'ORD-2024-3009',
    customer_id: 'CUS-1032',
    customer_name: 'Deepa Iyer',
    product: 'Modern Glass-Top Coffee Table with Oak Legs',
    category: 'Table',
    reason: 'Damaged on delivery',
    condition: 'Chipped edge on glass top',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    order: {
      order_id: 'ORD-2024-3009',
      product_name: 'Modern Glass-Top Coffee Table with Oak Legs',
      price: 16800,
      delivery_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
    },
    pickup: {
      address: '77, 80ft Road, HAL 3rd Stage, Indiranagar',
      city: 'Bengaluru',
      postal_code: '560075',
      area_cluster: 'BLR-EAST', // SAME AREA AS RET-3001 and RET-3002
      preferred_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      distance_km: 6.9
    },
    evidence: [
      {
        id: 'ev-3009-1',
        name: 'coffee_table_glass.jpg',
        size: 1800000,
        type: 'image/jpeg',
        dataUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&auto=format&fit=crop&q=60'
      }
    ]
  }
];

// Initial Module 5 Human Reviews corresponding to demo returns
export const DEMO_PICKUP_REVIEWS = {
  'RET-2024-003001': {
    return_id: 'RET-2024-003001',
    review_status: 'APPROVED',
    decision: {
      status: 'APPROVED',
      decision_type: 'APPROVE_PICKUP',
      reason: 'Verified photo evidence clearly shows transit corner damage upon unboxing. Customer has legitimate purchase history.',
      reason_categories: ['Strong Evidence of Damage', 'Customer History Considered'],
      override: false
    },
    reviewer: { name: 'Sunil Rao', role: 'Dispatcher' },
    review_completed_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  'RET-2024-003002': {
    return_id: 'RET-2024-003002',
    review_status: 'APPROVED',
    decision: {
      status: 'APPROVED',
      decision_type: 'APPROVE_PICKUP',
      reason: 'Manual override: System flagged high risk due to lifetime return frequency, but clear video verifies defective hydraulic piston in pristine condition.',
      reason_categories: ['Operational Constraint', 'Strong Evidence of Damage'],
      override: true,
      override_reason: 'Defective mechanism confirmed by video inspection despite historical return frequency.'
    },
    reviewer: { name: 'Kavita Menon', role: 'Operations Manager' },
    review_completed_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  'RET-2024-003003': {
    return_id: 'RET-2024-003003',
    review_status: 'APPROVED',
    decision: {
      status: 'APPROVED',
      decision_type: 'APPROVE_PICKUP',
      reason: 'High-value claim (₹85,000) verified by carrier delivery exception report. Approved for expedited retrieval to minimize transit liability.',
      reason_categories: ['High-Value Financial Exposure', 'Policy Requirement'],
      override: true,
      override_reason: 'Carrier delivery damage report confirmed on file.'
    },
    reviewer: { name: 'Rohan Deshmukh', role: 'Senior Operations Manager' },
    review_completed_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  'RET-2024-003004': {
    return_id: 'RET-2024-003004',
    review_status: 'REJECTED',
    decision: {
      status: 'REJECTED',
      decision_type: 'REJECT_RETURN',
      reason: 'Rejection confirmed: Customer submitted photo of an entirely different worn armchair from a non-partner brand. Carrier delivered in sealed wooden crate.',
      reason_categories: ['Evidence Inconsistent', 'Customer History Considered'],
      override: false
    },
    reviewer: { name: 'Sunil Rao', role: 'Dispatcher' },
    review_completed_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  'RET-2024-003005': {
    return_id: 'RET-2024-003005',
    review_status: 'WAITING_FOR_EVIDENCE',
    decision: {
      status: 'WAITING_FOR_EVIDENCE',
      decision_type: 'REQUEST_MORE_EVIDENCE',
      reason: 'Requested photos of hydraulic piston mounting bracket and serial barcode label before authorizing bulky disassembly pickup.',
      reason_categories: ['Evidence Insufficient'],
      override: false
    },
    evidence_requested: {
      items: ['Damage photo', 'Product serial number label', 'Packaging photos']
    },
    reviewer: { name: 'Sunil Rao', role: 'Dispatcher' },
    review_completed_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  'RET-2024-003006': {
    return_id: 'RET-2024-003006',
    review_status: 'ESCALATED',
    decision: {
      status: 'ESCALATED',
      decision_type: 'ESCALATE',
      reason: 'Escalated to Senior Operations Manager: Discrepancy between signed bill of lading (8 chairs delivered) and claim of missing items.',
      reason_categories: ['Operational Constraint', 'High-Value Financial Exposure'],
      override: false
    },
    escalation: {
      target: 'Senior Operations Manager',
      reason: 'Bill of lading discrepancy requires executive logistics review.'
    },
    reviewer: { name: 'Kavita Menon', role: 'Operations Manager' },
    review_completed_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  'RET-2024-003007': {
    return_id: 'RET-2024-003007',
    review_status: 'APPROVED',
    decision: {
      status: 'APPROVED',
      decision_type: 'APPROVE_PICKUP',
      reason: 'Shattered glass panel verified. Approved for pickup; waiting on customer address update.',
      reason_categories: ['Strong Evidence of Damage'],
      override: false
    },
    reviewer: { name: 'Sunil Rao', role: 'Dispatcher' },
    review_completed_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  'RET-2024-003008': {
    return_id: 'RET-2024-003008',
    review_status: 'APPROVED',
    decision: {
      status: 'APPROVED',
      decision_type: 'APPROVE_PICKUP',
      reason: 'Defective frame joint verified. Authorized standard courier retrieval.',
      reason_categories: ['Strong Evidence of Damage'],
      override: false
    },
    reviewer: { name: 'Sunil Rao', role: 'Dispatcher' },
    review_completed_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  'RET-2024-003009': {
    return_id: 'RET-2024-003009',
    review_status: 'APPROVED',
    decision: {
      status: 'APPROVED',
      decision_type: 'APPROVE_PICKUP',
      reason: 'Glass chip verified upon unboxing. Approved for cluster pickup with Indiranagar run.',
      reason_categories: ['Strong Evidence of Damage'],
      override: false
    },
    reviewer: { name: 'Sunil Rao', role: 'Dispatcher' },
    review_completed_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
};
