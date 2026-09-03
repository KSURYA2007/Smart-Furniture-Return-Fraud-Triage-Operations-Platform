/**
 * Module 3: Evidence & Product Condition Analysis Utility
 * 
 * Performs deterministic, rule-based extraction and structuring of return evidence.
 * 
 * IMPORTANT SCOPE RULES:
 * - Rule-based extraction only (clearly labeled, NOT AI).
 * - Factual evidence quality and consistency metrics only.
 * - NO fraud prediction, NO fraud risk scores, NO automated decision/rejection.
 */

// Keyword dictionaries for rule-based damage extraction
const DAMAGE_AREA_KEYWORDS = {
  Armrest: ['armrest', 'arm rest', 'arm cushion', 'arm', 'armrests'],
  Backrest: ['backrest', 'back rest', 'back support', 'cushion back', 'backboard'],
  Seat: ['seat', 'seating', 'seat cushion', 'base cushion', 'sitting area'],
  Leg: ['leg', 'legs', 'foot', 'feet', 'wooden leg', 'metal leg', 'stand'],
  Frame: ['frame', 'wooden frame', 'structure', 'chassis', 'skeleton', 'rail', 'underneath'],
  Drawer: ['drawer', 'drawers', 'slider', 'slide', 'pullout'],
  Door: ['door', 'doors', 'glass door', 'shutter', 'cabinet door', 'hinged door'],
  Surface: ['surface', 'tabletop', 'table top', 'top', 'panel', 'finish', 'laminate', 'veneer'],
  Wheel: ['wheel', 'wheels', 'caster', 'castor', 'roller'],
  Handle: ['handle', 'knob', 'pull', 'handles', 'latch'],
  Headboard: ['headboard', 'head board', 'bedhead']
};

const DAMAGE_TYPE_KEYWORDS = {
  Broken: ['broken', 'snapped', 'shattered', 'fractured', 'smashed', 'damaged completely'],
  Cracked: ['cracked', 'crack', 'hairline', 'split', 'splintered', 'chipped'],
  Scratched: ['scratched', 'scratch', 'scuff', 'abrasion', 'rub mark', 'scrape'],
  Dented: ['dented', 'dent', 'hollow', 'depression', 'ding', 'crushed'],
  Bent: ['bent', 'crooked', 'warped', 'misaligned', 'twisted', 'bowed'],
  Missing: ['missing', 'absent', 'not included', 'lost', 'lacking', 'omitted'],
  Stained: ['stained', 'stain', 'discolored', 'spill', 'dirty', 'dye variance', 'fade'],
  Torn: ['torn', 'tear', 'ripped', 'cut', 'slashed', 'punctured', 'frayed'],
  Loose: ['loose', 'wobbly', 'unstable', 'rattling', 'detached', 'unfastened']
};

/**
 * Extract damage areas from text description using deterministic keyword matching
 */
export function extractDamageAreas(text = '') {
  if (!text || typeof text !== 'string') return ['Other'];
  const lower = text.toLowerCase();
  const detected = [];

  for (const [area, keywords] of Object.entries(DAMAGE_AREA_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(area);
    }
  }

  return detected.length > 0 ? detected : ['Unspecified / General Surface'];
}

/**
 * Extract damage types from text description using deterministic keyword matching
 */
export function extractDamageTypes(text = '', condition = '', reason = '') {
  const combined = `${text} ${condition} ${reason}`.toLowerCase();
  const detected = [];

  for (const [type, keywords] of Object.entries(DAMAGE_TYPE_KEYWORDS)) {
    if (keywords.some(kw => combined.includes(kw))) {
      detected.push(type);
    }
  }

  return detected.length > 0 ? detected : ['General Defect / Other'];
}

/**
 * Perform comprehensive structured analysis on a return request's evidence
 */
export function analyzeReturnEvidence(returnRecord) {
  if (!returnRecord) return null;

  const returnId = returnRecord.return_id || 'UNKNOWN';
  const customer = returnRecord.customer || {
    customer_id: returnRecord.customer_id || 'CUS-UNKNOWN',
    name: returnRecord.customer_name || 'Customer'
  };
  const order = returnRecord.order || {
    order_id: returnRecord.order_id || 'ORD-UNKNOWN',
    product_name: returnRecord.product || 'Furniture Item',
    category: returnRecord.category || 'Bulky Furniture',
    product_price: returnRecord.product_price || returnRecord.price || 25000,
    purchase_date: returnRecord.purchase_date,
    delivery_date: returnRecord.delivery_date
  };
  const returnInfo = returnRecord.return || {
    reason: returnRecord.reason || 'Damaged on delivery',
    condition: returnRecord.condition || 'Visible Defect',
    description: returnRecord.description || returnRecord.notes || returnRecord.condition || ''
  };
  
  // Normalize evidence list
  let evidenceList = [];
  if (Array.isArray(returnRecord.evidence)) {
    evidenceList = returnRecord.evidence;
  } else if (Array.isArray(returnRecord.evidence_images)) {
    evidenceList = returnRecord.evidence_images.map((img, idx) => ({
      id: `img_${idx}`,
      name: `evidence_photo_${idx + 1}.jpg`,
      size: 1500000 + (idx * 400000),
      type: 'image/jpeg',
      dataUrl: img,
      uploadedAt: returnRecord.return_date || returnRecord.created_at
    }));
  }

  const image_count = evidenceList.length;
  const description = (returnInfo.description || returnRecord.notes || returnRecord.reason || '').trim();
  const condition = (returnInfo.condition || returnRecord.condition || '').trim();
  const reason = (returnInfo.reason || returnRecord.reason || '').trim();

  // 1. Evidence Coverage Assessment
  let evidence_coverage = 'NO_EVIDENCE';
  let coverage_label = 'No evidence submitted';
  if (image_count === 1) {
    evidence_coverage = 'LIMITED';
    coverage_label = 'Limited evidence (1 image)';
  } else if (image_count >= 2 && image_count <= 3) {
    evidence_coverage = 'MODERATE';
    coverage_label = `Moderate evidence (${image_count} images)`;
  } else if (image_count >= 4) {
    evidence_coverage = 'STRONG';
    coverage_label = `Strong evidence coverage (${image_count} images)`;
  }

  // 2. Validate Files & Check Quality
  const findings = [];
  const warnings = [];
  let usable_image_count = 0;
  const duplicateNames = new Set();
  const seenNames = new Set();

  evidenceList.forEach((file, index) => {
    const fileName = file.name || `Image_${index + 1}`;
    const fileSize = file.size || 0;
    const fileType = file.type || 'image/jpeg';
    const isUnder10MB = fileSize <= 10 * 1024 * 1024;
    const isSupported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].some(t => fileType.toLowerCase().includes(t.split('/')[1]));

    if (seenNames.has(fileName)) {
      duplicateNames.add(fileName);
      warnings.push({
        text: `Duplicate file name "${fileName}" detected.`,
        source: fileName,
        level: 'warning'
      });
    } else {
      seenNames.add(fileName);
    }

    if (isSupported && isUnder10MB) {
      usable_image_count++;
    } else {
      if (!isSupported) {
        warnings.push({
          text: `Unsupported image format (${fileType}) for "${fileName}".`,
          source: fileName,
          level: 'error'
        });
      }
      if (!isUnder10MB) {
        warnings.push({
          text: `File "${fileName}" exceeds 10MB limit.`,
          source: fileName,
          level: 'warning'
        });
      }
    }
  });

  // Basic image quality assessment
  let image_quality = 'FAIR';
  if (usable_image_count >= 3) image_quality = 'EXCELLENT';
  else if (usable_image_count >= 2) image_quality = 'GOOD';
  else if (usable_image_count === 1) image_quality = 'FAIR';
  else image_quality = 'POOR';

  // 3. Rule-Based Damage Extraction
  const detected_damage_areas = extractDamageAreas(description);
  const detected_damage_types = extractDamageTypes(description, condition, reason);

  // 4. Traceable Findings Generation
  if (image_count > 0) {
    findings.push({
      text: `${image_count} evidence photo${image_count !== 1 ? 's' : ''} submitted and verified for format compatibility.`,
      source: evidenceList[0]?.name || 'Uploaded evidence files'
    });
  }

  if (description.length > 0) {
    findings.push({
      text: `Customer damage statement provided: "${description.length > 60 ? description.substring(0, 57) + '...' : description}"`,
      source: 'Customer intake form'
    });
  }

  if (detected_damage_areas.length > 0 && !detected_damage_areas.includes('Unspecified / General Surface')) {
    findings.push({
      text: `Identified specific product component: ${detected_damage_areas.join(', ')}`,
      source: 'Rule-based text extraction'
    });
  }

  if (condition) {
    findings.push({
      text: `Customer reported condition categorized as: "${condition}"`,
      source: 'Product condition selection'
    });
  }

  // 5. Damage Visibility & Evidence Completeness
  let damage_visibility = 'CLEARLY_VISIBLE';
  if (image_count === 0) damage_visibility = 'NOT_VISIBLE';
  else if (image_count === 1) damage_visibility = 'PARTIALLY_VISIBLE';
  else damage_visibility = 'CLEARLY_VISIBLE';

  let evidence_completeness = 'COMPLETE';
  if (image_count === 0 || !description) {
    evidence_completeness = 'INSUFFICIENT';
  } else if (image_count < 2 || !condition) {
    evidence_completeness = 'PARTIALLY_COMPLETE';
  } else {
    evidence_completeness = 'COMPLETE';
  }

  // 6. Condition & Reason Consistency Comparison
  let condition_consistency = 'CONSISTENT';
  let consistency_explanation = 'Reported damage condition aligns with submitted description and visible photographic evidence.';

  const isMinorCondition = condition.toLowerCase().includes('minor') || condition.toLowerCase().includes('cosmetic');
  const isMajorCondition = condition.toLowerCase().includes('major') || condition.toLowerCase().includes('broken') || condition.toLowerCase().includes('severe');
  const hasSevereKeyword = detected_damage_types.includes('Broken') || detected_damage_types.includes('Torn');

  if (image_count === 0) {
    condition_consistency = 'INSUFFICIENT_EVIDENCE';
    consistency_explanation = 'Cannot verify consistency due to lack of submitted photographic evidence.';
  } else if (isMinorCondition && hasSevereKeyword) {
    condition_consistency = 'PARTIALLY_CONSISTENT';
    consistency_explanation = 'Customer selected minor condition but described structural breakage.';
  } else if (reason.toLowerCase().includes('missing') && !description.toLowerCase().includes('missing') && !description.toLowerCase().includes('part')) {
    condition_consistency = 'PARTIALLY_CONSISTENT';
    consistency_explanation = 'Return reason states missing parts but damage description specifies physical breakage.';
  } else {
    condition_consistency = 'CONSISTENT';
  }

  // 7. Evidence Strength (HIGH / MEDIUM / LOW - Strictly based on evidence quality)
  let evidence_strength = 'MEDIUM';
  if (usable_image_count >= 3 && description.length >= 20 && condition && condition_consistency === 'CONSISTENT') {
    evidence_strength = 'HIGH';
  } else if (usable_image_count >= 1 && description.length > 0) {
    evidence_strength = 'MEDIUM';
  } else {
    evidence_strength = 'LOW';
  }

  // 8. Evidence Checklist
  const checklist = [
    {
      id: 'photo_submitted',
      label: 'At least one damage photo submitted',
      passed: image_count >= 1,
      warning: image_count === 0 ? 'No evidence photos uploaded.' : null
    },
    {
      id: 'multiple_angles',
      label: 'Multiple perspective angles provided',
      passed: image_count >= 2,
      warning: image_count < 2 ? 'Single angle only; additional contextual photo recommended.' : null
    },
    {
      id: 'damage_area_identified',
      label: 'Specific damage area identifiable',
      passed: detected_damage_areas.length > 0 && !detected_damage_areas.includes('Unspecified / General Surface'),
      warning: detected_damage_areas.includes('Unspecified / General Surface') ? 'Damage location not specifically pinpointed in text.' : null
    },
    {
      id: 'description_provided',
      label: 'Damage description statement provided',
      passed: description.length >= 10,
      warning: description.length < 10 ? 'Description is brief or missing.' : null
    },
    {
      id: 'condition_selected',
      label: 'Product condition tier selected',
      passed: !!condition,
      warning: !condition ? 'Product condition category not specified.' : null
    },
    {
      id: 'files_valid',
      label: 'All files valid and under 10MB limit',
      passed: warnings.length === 0,
      warning: warnings.length > 0 ? `${warnings.length} file warning(s) detected.` : null
    }
  ];

  // 9. Timeline Calculation
  const purchaseDateStr = order.purchase_date || null;
  const deliveryDateStr = order.delivery_date || null;
  const returnDateStr = returnRecord.return_date || returnRecord.created_at || new Date().toISOString();

  let days_from_delivery_to_return = null;
  if (deliveryDateStr && returnDateStr) {
    try {
      const d1 = new Date(deliveryDateStr.split('T')[0]);
      const d2 = new Date(returnDateStr.split('T')[0]);
      const diffTime = d2.getTime() - d1.getTime();
      days_from_delivery_to_return = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      days_from_delivery_to_return = null;
    }
  }

  return {
    return_id: returnId,
    customer,
    order,
    returnInfo,
    evidenceList,
    image_count,
    usable_image_count,
    evidence_coverage,
    coverage_label,
    image_quality,
    damage_visibility,
    evidence_completeness,
    detected_damage_areas,
    detected_damage_types,
    condition_consistency,
    consistency_explanation,
    evidence_strength,
    findings,
    warnings,
    checklist,
    timeline: {
      purchase_date: purchaseDateStr,
      delivery_date: deliveryDateStr,
      return_date: returnDateStr,
      days_from_delivery_to_return
    }
  };
}
