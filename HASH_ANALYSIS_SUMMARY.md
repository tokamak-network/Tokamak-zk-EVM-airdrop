# Hash Analysis Summary

## 🔍 Hash Discrepancy Investigation Results

When using the online SHA256 tool at [https://emn178.github.io/online-tools/sha256_checksum.html](https://emn178.github.io/online-tools/sha256_checksum.html), you got a different hash than what our verification script produced. Here's the complete analysis:

## 📊 Hash Results Comparison

| Method | Hash Value | Description |
|--------|------------|-------------|
| **Online Tool Result** | `2ded61dc3f3df717ef43b6784205100305ad443f47369b4ac8fd56d30003bf4c` | Raw file hash from online tool |
| **Raw File Hash** | `2ded61dc3f3df717ef43b6784205100305ad443f47369b4ac8fd56d30003bf4c` | Direct SHA256 of proof.json file |
| **Proof Entries Hash** | `3f58702a94fb6143732832465e9c186f20a7bf5b1060e710ddf45a3f99d5853a` | Processed proof entries (zipProcessor.ts method) |
| **Proof Hash (with 0x)** | `0x3f58702a94fb6143732832465e9c186f20a7bf5b1060e710ddf45a3f99d5853a` | Final proof hash used in application |

## ✅ Key Findings

### 1. **Online Tool Accuracy Confirmed**
- ✅ The online SHA256 tool result **EXACTLY MATCHES** the raw file hash
- ✅ Both produce: `2ded61dc3f3df717ef43b6784205100305ad443f47369b4ac8fd56d30003bf4c`

### 2. **Two Different Hashing Approaches**

#### **Method A: File Integrity Hash** (Online Tool Method)
- **Input**: Complete `proof.json` file content (4,768 bytes)
- **Includes**: All formatting, whitespace, indentation, newlines
- **Use Case**: File integrity verification, file checksums
- **Result**: `2ded61dc3f3df717ef43b6784205100305ad443f47369b4ac8fd56d30003bf4c`

#### **Method B: Proof Content Hash** (zipProcessor.ts Method)
- **Input**: Only proof entries data (4,353 chars processed JSON)
- **Excludes**: Original formatting, focuses on actual proof data
- **Process**: Extract → Sort Keys → Stringify → Hash
- **Use Case**: Zero-knowledge proof verification, cryptographic validation
- **Result**: `0x3f58702a94fb6143732832465e9c186f20a7bf5b1060e710ddf45a3f99d5853a`

## 🎯 Why the Difference?

### File Content vs Proof Data
```
Raw File (4,768 bytes):     {
                               "proof_entries_part1": [
                                 "0x0f822e279640d6866ff767eb7f8daa17",
                                 ...
                               ]
                             }

Processed Data (4,353 chars): {"proof_entries_part1":["0x0f822e279640d6866ff767eb7f8daa17",...]}
```

The difference in size (4,768 vs 4,353) comes from:
- **Whitespace removal**: Spaces, tabs, newlines
- **Formatting normalization**: Consistent JSON structure
- **Key sorting**: Deterministic object key ordering

## 🔧 Technical Implementation

### Raw File Hash (Online Tool)
```bash
cat proof.json | shasum -a 256
# Result: 2ded61dc3f3df717ef43b6784205100305ad443f47369b4ac8fd56d30003bf4c
```

### Proof Entries Hash (zipProcessor.ts)
```javascript
const proofHashInput = {
  proof_entries_part1: proofData.proof_entries_part1,
  proof_entries_part2: proofData.proof_entries_part2
};
const dataString = JSON.stringify(proofHashInput, Object.keys(proofHashInput).sort());
const hash = '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
// Result: 0x3f58702a94fb6143732832465e9c186f20a7bf5b1060e710ddf45a3f99d5853a
```

## 📋 Use Case Mapping

### When to Use Each Hash:

#### **File Integrity Hash** (`2ded61dc...`)
- ✅ Verifying file hasn't been corrupted during transfer
- ✅ Checking if the original `proof.json` file is intact
- ✅ Comparing with online SHA256 tools
- ✅ File-level checksums

#### **Proof Verification Hash** (`0x3f58702a...`)
- ✅ ZK-proof cryptographic verification
- ✅ Blockchain-related proof validation
- ✅ Application-level proof processing
- ✅ Consistent hashing regardless of file formatting

## 🚀 Scripts Available

### 1. Basic Verification
```bash
node scripts/verify-proof-hash.js
```

### 2. Method Comparison
```bash
node scripts/compare-hash-methods.js
```

## 🎯 Conclusion

**Both hashes are correct** - they serve different purposes:

- **Online tool hash**: Verifies the complete file integrity
- **Application hash**: Verifies the cryptographic proof content

The choice depends on your use case. For ZK-proof validation in the Tokamak network, use the proof entries hash (`0x3f58702a...`). For file integrity checks, use the raw file hash (`2ded61dc...`).

## 🔗 References

- [Online SHA256 Tool](https://emn178.github.io/online-tools/sha256_checksum.html)
- `utils/zipProcessor.ts` - Proof hash computation logic
- `scripts/verify-proof-hash.js` - Verification script
- `scripts/compare-hash-methods.js` - Method comparison script
