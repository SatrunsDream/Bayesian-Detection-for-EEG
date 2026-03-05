import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../');
const artifactsTables = path.resolve(root, '../artifacts/tables');
const outputDir = path.resolve(root, 'src/data');
const outputFile = path.join(outputDir, 'researchData.ts');

const mappings = {
  'eda__value_stats_all_participants': 'VALUE_STATS',
  'quality__qc_summary': 'QC_SUMMARY',
  'bocpd__across_reps_summary': 'ACROSS_REPS_SUMMARY',
  'bocpd__across_reps_aggregate_channels_summary': 'ACROSS_REPS_AGGREGATE_SUMMARY',
  'bocpd__within_epoch_variance_peak_latency': 'WITHIN_EPOCH_VARIANCE',
  'bocpd__synthetic_evaluation': 'SYNTHETIC_EVAL',
  'trial_rep__variance_summary': 'TRIAL_REP_VARIANCE',
  'temporal__peak_variance_latency': 'TEMPORAL_PEAK_VARIANCE',
  'temporal__variance_by_window': 'TEMPORAL_VARIANCE_BY_WINDOW',
  'quality__trial_outliers': 'QUALITY_TRIAL_OUTLIERS',
  'quality__autocorrelation': 'QUALITY_AUTOCORRELATION',
  'features__log_bandpower_summary': 'FEATURES_LOG_BANDPOWER',
  'bocpd__within_epoch_peak_latency': 'BOCPD_WITHIN_EPOCH_MEAN',
  'bocpd__within_epoch_variance_per_condition': 'BOCPD_VARIANCE_PER_CONDITION',
  'bocpd__synthetic_no_cp': 'BOCPD_SYNTHETIC_NO_CP',
  'spectral__bandpower_summary': 'SPECTRAL_BANDPOWER',
};

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    // Handle quoted values if necessary, but for now simple split
    // This regex handles commas inside quotes
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    
    // Fallback to simple split if regex fails or for simple CSVs
    const simpleValues = line.split(',').map(v => v.trim());
    const finalValues = values.length === headers.length ? values : simpleValues;

    const obj = {};
    headers.forEach((h, i) => {
      let val = finalValues[i];
      if (val === undefined) val = '';
      
      // Remove quotes
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }

      // Try to parse as number
      if (!isNaN(parseFloat(val)) && isFinite(val)) {
        obj[h] = parseFloat(val);
      } else if (val.toLowerCase() === 'true') {
        obj[h] = true;
      } else if (val.toLowerCase() === 'false') {
        obj[h] = false;
      } else {
        obj[h] = val;
      }
    });
    return obj;
  });
}

function updateData() {
  if (!fs.existsSync(artifactsTables)) {
    console.warn(`Artifacts tables directory not found: ${artifactsTables}`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let outputContent = '// GENERATED FILE - DO NOT EDIT MANUALLY\n// Run `npm run update-data` to regenerate\n\n';

  const files = fs.readdirSync(artifactsTables).filter(f => f.endsWith('.csv'));
  
  for (const [prefix, exportName] of Object.entries(mappings)) {
    // Find the latest file matching the prefix (assuming date suffix)
    const matchingFiles = files.filter(f => f.startsWith(prefix)).sort().reverse();
    
    if (matchingFiles.length > 0) {
      const file = matchingFiles[0];
      const content = fs.readFileSync(path.join(artifactsTables, file), 'utf-8');
      const data = parseCSV(content);
      
      outputContent += `export const ${exportName} = ${JSON.stringify(data, null, 2)};\n\n`;
      console.log(`Generated ${exportName} from ${file}`);
    } else {
      console.warn(`No CSV found for prefix: ${prefix}`);
      outputContent += `export const ${exportName} = [];\n\n`;
    }
  }

  fs.writeFileSync(outputFile, outputContent);
  console.log(`Updated ${outputFile}`);
}

updateData();
