import { Breed, FitConfidence, Size } from '../types';

type MeasurementKey = 'backLength' | 'neckGirth' | 'chestGirth';

type SizeRange = Record<MeasurementKey, [number, number]>;

type BreedSizeChart = Record<Size, SizeRange>;

export interface SizeRecommendationResult {
  size: Size;
  confidence: FitConfidence;
}

export const breedSizeCharts: Record<Breed, BreedSizeChart> = {
  'Labrador Retriever': {
    XS: { backLength: [25, 30], neckGirth: [20, 25], chestGirth: [35, 45] },
    S: { backLength: [30, 40], neckGirth: [25, 35], chestGirth: [45, 55] },
    M: { backLength: [40, 50], neckGirth: [35, 45], chestGirth: [55, 65] },
    L: { backLength: [50, 60], neckGirth: [45, 55], chestGirth: [65, 80] },
    XL: { backLength: [60, 70], neckGirth: [55, 65], chestGirth: [80, 95] },
  },
  'Shih Tzu': {
    XS: { backLength: [22, 26], neckGirth: [20, 24], chestGirth: [30, 36] },
    S: { backLength: [26, 30], neckGirth: [24, 28], chestGirth: [36, 42] },
    M: { backLength: [30, 36], neckGirth: [28, 32], chestGirth: [42, 48] },
    L: { backLength: [36, 42], neckGirth: [32, 36], chestGirth: [48, 54] },
    XL: { backLength: [42, 48], neckGirth: [36, 40], chestGirth: [54, 60] },
  },
  Dachshund: {
    XS: { backLength: [22, 26], neckGirth: [20, 24], chestGirth: [30, 36] },
    S: { backLength: [26, 30], neckGirth: [24, 28], chestGirth: [36, 42] },
    M: { backLength: [30, 36], neckGirth: [28, 32], chestGirth: [42, 48] },
    L: { backLength: [36, 42], neckGirth: [32, 36], chestGirth: [48, 54] },
    XL: { backLength: [42, 48], neckGirth: [36, 40], chestGirth: [54, 60] },
  },
  Pomeranian: {
    XS: { backLength: [16, 20], neckGirth: [16, 20], chestGirth: [24, 30] },
    S: { backLength: [20, 24], neckGirth: [20, 24], chestGirth: [30, 36] },
    M: { backLength: [24, 28], neckGirth: [24, 28], chestGirth: [36, 42] },
    L: { backLength: [28, 32], neckGirth: [28, 32], chestGirth: [42, 48] },
    XL: { backLength: [32, 36], neckGirth: [32, 36], chestGirth: [48, 54] },
  },
  'Aspin/Mixed': {
    XS: { backLength: [25, 30], neckGirth: [20, 25], chestGirth: [35, 45] },
    S: { backLength: [30, 40], neckGirth: [25, 35], chestGirth: [45, 55] },
    M: { backLength: [40, 50], neckGirth: [35, 45], chestGirth: [55, 65] },
    L: { backLength: [50, 60], neckGirth: [45, 55], chestGirth: [65, 80] },
    XL: { backLength: [60, 70], neckGirth: [55, 65], chestGirth: [80, 95] },
  },
};

const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL'];
const measurementKeys: MeasurementKey[] = ['backLength', 'neckGirth', 'chestGirth'];

const hasMeasurement = (value?: number) => typeof value === 'number' && value > 0;

const isWithinRange = (value: number, [min, max]: [number, number]) => value >= min && value <= max;

const isCentralRange = (value: number, [min, max]: [number, number]) => {
  const buffer = (max - min) * 0.05;
  return value > min + buffer && value < max - buffer;
};

const isNearBoundary = (value: number, [min, max]: [number, number]) => {
  const buffer = (max - min) * 0.05;
  return value <= min + buffer || value >= max - buffer;
};

export function getSizeRecommendation(
  breed: Breed,
  backLength?: number,
  neckGirth?: number,
  chestGirth?: number
): SizeRecommendationResult {
  const chart = breedSizeCharts[breed] ?? breedSizeCharts['Aspin/Mixed'];
  const measurements = { backLength, neckGirth, chestGirth };

  if (!measurementKeys.some(key => hasMeasurement(measurements[key]))) {
    return { size: 'M', confidence: 'Check Fit' };
  }

  const exceedsMaximum = measurementKeys.some(key => {
    const value = measurements[key];
    return hasMeasurement(value) && value! > chart.XL[key][1];
  });

  if (exceedsMaximum) {
    return { size: 'XL', confidence: 'Custom Fit Recommended' };
  }

  const matchingSize = sizes.find(size =>
    measurementKeys.every(key => {
      const value = measurements[key];
      return !hasMeasurement(value) || isWithinRange(value!, chart[size][key]);
    })
  );

  if (!matchingSize) {
    const firstProvidedKey = measurementKeys.find(key => hasMeasurement(measurements[key]));
    const firstProvidedValue = firstProvidedKey ? measurements[firstProvidedKey]! : 0;
    const fallbackSize = sizes.find(size =>
      firstProvidedKey ? isWithinRange(firstProvidedValue, chart[size][firstProvidedKey]) : false
    ) ?? 'M';

    return { size: fallbackSize, confidence: 'Custom Fit Recommended' };
  }

  const providedKeys = measurementKeys.filter(key => hasMeasurement(measurements[key]));
  const allCentral = providedKeys.every(key => isCentralRange(measurements[key]!, chart[matchingSize][key]));
  const nearBoundary = providedKeys.some(key => isNearBoundary(measurements[key]!, chart[matchingSize][key]));

  return {
    size: matchingSize,
    confidence: allCentral && !nearBoundary ? 'Good Fit' : 'Check Fit',
  };
}
