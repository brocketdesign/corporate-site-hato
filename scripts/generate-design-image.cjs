#!/usr/bin/env node
/**
 * generate-design-image.js
 * 
 * Standalone CLI script for generating images using zImageTurbo or GrokImagineImage.
 * Designed to be called by the AI assistant (GitHub Copilot) to produce design assets
 * such as background images, icons, illustrations, etc.
 * 
 * Usage:
 *   node scripts/generate-design-image.js --prompt "A futuristic city skyline at sunset" --model grok
 *   node scripts/generate-design-image.js --prompt "Abstract gradient background" --model turbo --aspect 16:9
 *   node scripts/generate-design-image.js --prompt "Minimal chat icon" --model grok --output public/img/icons/chat-icon.png
 *   node scripts/generate-design-image.js --prompt "..." --model turbo --aspect 9:16 --output public/img/bg/hero.png
 * 
 * Models:
 *   turbo  → z-image-turbo (Novita AI, async with polling)
 *   grok   → grok-imagine-image (xAI, synchronous)
 * 
 * Options:
 *   --prompt, -p    Image generation prompt (required)
 *   --model, -m     Model to use: "turbo" or "grok" (default: grok)
 *   --aspect, -a    Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3 (default: 1:1)
 *   --output, -o    Output file path relative to project root (default: auto-generated in public/img/generated/)
 *   --name, -n      Filename (without extension) for the output image (default: timestamp-based)
 *   --count, -c     Number of images to generate (default: 1, grok only)
 *   --seed, -s      Seed for reproducibility (turbo only, default: -1 for random)
 *   --format, -f    Output format: png, jpg, webp (default: png)
 *   --quality, -q   Quality for jpg/webp: 1-100 (default: 90)
 *   --resize, -r    Resize output: WIDTHxHEIGHT (e.g., 512x512, optional)
 *   --info          Print image info (dimensions, size) after generation
 *   --dry-run       Show what would be done without making API calls
 *   --help, -h      Show this help message
 * 
 * Environment Variables (required):
 *   XAI_API_KEY       — For grok-imagine-image (xAI)
 *   NOVITA_API_KEY    — For z-image-turbo (Novita AI)
 * 
 * Examples:
 *   # Generate a background image with Grok
 *   node scripts/generate-design-image.js -p "Dark gradient background with subtle geometric patterns, modern UI design" -m grok -a 16:9 -o public/img/bg/dark-geo.png
 * 
 *   # Generate an icon with z-image-turbo
 *   node scripts/generate-design-image.js -p "Minimalist heart icon, flat design, white on transparent" -m turbo -a 1:1 --resize 64x64 -o public/img/icons/heart.png
 * 
 *   # Generate multiple variations with Grok
 *   node scripts/generate-design-image.js -p "Anime style avatar, female character" -m grok -c 4
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Optional: sharp for image processing (resize, format conversion)
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    // sharp is optional — only needed for --resize and --format conversion
}

// ─── Constants ───────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'img', 'generated');

const MODELS = {
    turbo: {
        id: 'z-image-turbo',
        name: 'Z Image Turbo',
        provider: 'novita',
        endpoint: 'https://api.novita.ai/v3/async/z-image-turbo',
        pollEndpoint: 'https://api.novita.ai/v3/async/task-result',
        async: true,
        envKey: 'NOVITA_API_KEY',
    },
    grok: {
        id: 'grok-imagine-image',
        name: 'Grok Imagine Image',
        provider: 'xai',
        endpoint: 'https://api.x.ai/v1/images/generations',
        async: false,
        envKey: 'XAI_KEY',
    },
};

const ASPECT_TO_SIZE = {
    '1:1': '1024*1024',
    '16:9': '1280*720',
    '9:16': '720*1280',
    '4:3': '1024*768',
    '3:4': '768*1024',
    '3:2': '1024*683',
    '2:3': '683*1024',
};

// ─── Argument Parsing ────────────────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        prompt: null,
        model: 'grok',
        aspect: '1:1',
        output: null,
        name: null,
        count: 1,
        seed: -1,
        format: 'png',
        quality: 90,
        resize: null,
        info: false,
        dryRun: false,
        help: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--prompt': case '-p':
                parsed.prompt = next; i++; break;
            case '--model': case '-m':
                parsed.model = next?.toLowerCase(); i++; break;
            case '--aspect': case '-a':
                parsed.aspect = next; i++; break;
            case '--output': case '-o':
                parsed.output = next; i++; break;
            case '--name': case '-n':
                parsed.name = next; i++; break;
            case '--count': case '-c':
                parsed.count = parseInt(next, 10) || 1; i++; break;
            case '--seed': case '-s':
                parsed.seed = parseInt(next, 10); i++; break;
            case '--format': case '-f':
                parsed.format = next?.toLowerCase(); i++; break;
            case '--quality': case '-q':
                parsed.quality = parseInt(next, 10) || 90; i++; break;
            case '--resize': case '-r':
                parsed.resize = next; i++; break;
            case '--info':
                parsed.info = true; break;
            case '--dry-run':
                parsed.dryRun = true; break;
            case '--help': case '-h':
                parsed.help = true; break;
        }
    }

    return parsed;
}

function printHelp() {
    const helpText = fs.readFileSync(__filename, 'utf8');
    const match = helpText.match(/\/\*\*([\s\S]*?)\*\//);
    if (match) {
        const lines = match[1].split('\n').map(l => l.replace(/^\s*\*\s?/, ''));
        console.log(lines.join('\n'));
    }
}

// ─── Utilities ───────────────────────────────────────────────────────

function generateFilename(prompt, index, format) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const slug = prompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);
    const suffix = index > 0 ? `-${index + 1}` : '';
    return `${timestamp}_${slug}${suffix}.${format}`;
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${path.relative(PROJECT_ROOT, dirPath)}`);
    }
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Image Generation: Grok (xAI) ───────────────────────────────────

async function generateWithGrok(prompt, aspect, count, apiKey) {
    console.log(`\n🎨 Generating with Grok Imagine Image...`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Aspect: ${aspect}`);
    console.log(`   Count: ${count}`);

    const body = {
        model: 'grok-imagine-image',
        prompt: prompt,
        n: Math.min(count, 4), // xAI allows up to 4
        response_format: 'url',
        aspect_ratio: aspect,
    };

    const response = await axios.post(MODELS.grok.endpoint, body, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 min timeout
    });

    const images = response.data.data.map((item, idx) => ({
        url: item.url,
        index: idx,
        revised_prompt: item.revised_prompt || null,
    }));

    console.log(`   ✅ Received ${images.length} image(s)`);
    return images;
}

// ─── Image Generation: z-image-turbo (Novita, async) ─────────────────

async function generateWithTurbo(prompt, size, seed, apiKey) {
    console.log(`\n🎨 Generating with Z Image Turbo...`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Size: ${size}`);
    console.log(`   Seed: ${seed === -1 ? 'random' : seed}`);

    // Step 1: Submit async task
    const body = {
        prompt: prompt,
        size: size,
        seed: seed,
    };

    const response = await axios.post(MODELS.turbo.endpoint, body, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 60000,
    });

    const taskId = response.data.task_id;
    if (!taskId) {
        throw new Error('No task_id returned from Novita API');
    }

    console.log(`   📋 Task submitted: ${taskId}`);
    console.log(`   ⏳ Polling for result...`);

    // Step 2: Poll for task completion
    const images = await pollNovitaTask(taskId, apiKey);
    console.log(`   ✅ Received ${images.length} image(s)`);
    return images;
}

async function pollNovitaTask(taskId, apiKey, maxAttempts = 60, intervalMs = 3000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await sleep(intervalMs);

        try {
            const response = await axios.get(MODELS.turbo.pollEndpoint, {
                params: { task_id: taskId },
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                timeout: 30000,
            });

            const { task } = response.data;
            const status = task?.status;

            if (status === 'TASK_STATUS_SUCCEED') {
                const images = (task.images || []).map((img, idx) => ({
                    url: img.image_url || img.url,
                    index: idx,
                    nsfw: img.nsfw || false,
                }));
                return images;
            } else if (status === 'TASK_STATUS_FAILED') {
                throw new Error(`Task failed: ${task.reason || 'Unknown error'}`);
            }

            // Still processing
            const elapsed = attempt * intervalMs / 1000;
            process.stdout.write(`\r   ⏳ Polling... ${elapsed}s elapsed (status: ${status || 'pending'})`);
        } catch (err) {
            if (err.message.includes('Task failed')) throw err;
            // Network errors — retry
            console.warn(`\n   ⚠️  Poll attempt ${attempt} failed: ${err.message}`);
        }
    }

    throw new Error(`Task ${taskId} timed out after ${maxAttempts * intervalMs / 1000}s`);
}

// ─── Image Download & Processing ─────────────────────────────────────

async function downloadImage(url) {
    console.log(`   📥 Downloading image...`);
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
    });
    return Buffer.from(response.data, 'binary');
}

async function processImage(buffer, options) {
    if (!sharp) {
        if (options.resize || options.format !== 'png') {
            console.warn('   ⚠️  sharp not available — skipping resize/format conversion');
        }
        return { buffer, ext: 'png' };
    }

    let pipeline = sharp(buffer);
    const meta = await sharp(buffer).metadata();
    let ext = options.format;

    // Resize if requested
    if (options.resize) {
        const [w, h] = options.resize.split('x').map(Number);
        if (w && h) {
            pipeline = pipeline.resize(w, h, { fit: 'cover' });
            console.log(`   📐 Resizing to ${w}x${h}`);
        }
    }

    // Format conversion
    switch (ext) {
        case 'jpg': case 'jpeg':
            pipeline = pipeline.jpeg({ quality: options.quality });
            ext = 'jpg';
            break;
        case 'webp':
            pipeline = pipeline.webp({ quality: options.quality });
            break;
        case 'png':
        default:
            pipeline = pipeline.png();
            ext = 'png';
            break;
    }

    const outputBuffer = await pipeline.toBuffer();
    return { buffer: outputBuffer, ext, meta };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
    const opts = parseArgs();

    if (opts.help) {
        printHelp();
        process.exit(0);
    }

    // Validate inputs
    if (!opts.prompt) {
        console.error('❌ Error: --prompt is required');
        console.error('   Usage: node scripts/generate-design-image.js --prompt "your prompt" [options]');
        console.error('   Use --help for full usage information');
        process.exit(1);
    }

    if (!MODELS[opts.model]) {
        console.error(`❌ Error: Unknown model "${opts.model}". Use "turbo" or "grok".`);
        process.exit(1);
    }

    if (!ASPECT_TO_SIZE[opts.aspect]) {
        console.error(`❌ Error: Unknown aspect ratio "${opts.aspect}". Use: ${Object.keys(ASPECT_TO_SIZE).join(', ')}`);
        process.exit(1);
    }

    const model = MODELS[opts.model];
    const apiKey = process.env[model.envKey];

    if (!apiKey) {
        console.error(`❌ Error: ${model.envKey} environment variable is not set`);
        console.error(`   Set it in your .env file or export it: export ${model.envKey}=your_key`);
        process.exit(1);
    }

    // Determine output path
    let outputDir, outputFilename;
    if (opts.output) {
        const fullPath = path.isAbsolute(opts.output)
            ? opts.output
            : path.join(PROJECT_ROOT, opts.output);
        outputDir = path.dirname(fullPath);
        outputFilename = path.basename(fullPath, path.extname(fullPath));
        // Use the extension from --output if provided, else use --format
        const outputExt = path.extname(fullPath).slice(1);
        if (outputExt && ['png', 'jpg', 'jpeg', 'webp'].includes(outputExt.toLowerCase())) {
            opts.format = outputExt.toLowerCase();
        }
    } else {
        outputDir = DEFAULT_OUTPUT_DIR;
        outputFilename = opts.name || null; // null = auto-generate
    }

    // Dry run
    if (opts.dryRun) {
        console.log('\n🔍 Dry Run — No API calls will be made\n');
        console.log(`   Model:   ${model.name} (${model.id})`);
        console.log(`   Prompt:  "${opts.prompt}"`);
        console.log(`   Aspect:  ${opts.aspect}`);
        console.log(`   Size:    ${ASPECT_TO_SIZE[opts.aspect]}`);
        console.log(`   Format:  ${opts.format}`);
        console.log(`   Resize:  ${opts.resize || 'none'}`);
        console.log(`   Output:  ${path.relative(PROJECT_ROOT, outputDir)}/${outputFilename || '<auto>'}.${opts.format}`);
        console.log(`   API Key: ${model.envKey} = ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
        process.exit(0);
    }

    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     🖼️  Design Image Generator               ║');
    console.log('╚══════════════════════════════════════════════╝');

    try {
        // Generate images
        let rawImages;
        if (opts.model === 'grok') {
            rawImages = await generateWithGrok(opts.prompt, opts.aspect, opts.count, apiKey);
        } else {
            // Turbo generates 1 at a time, loop for count
            rawImages = [];
            for (let i = 0; i < opts.count; i++) {
                const imgs = await generateWithTurbo(
                    opts.prompt,
                    ASPECT_TO_SIZE[opts.aspect],
                    opts.seed === -1 ? -1 : opts.seed + i,
                    apiKey
                );
                rawImages.push(...imgs.map(img => ({ ...img, index: rawImages.length + img.index })));
            }
        }

        if (!rawImages.length) {
            console.error('❌ No images returned from API');
            process.exit(1);
        }

        // Download, process, and save each image
        ensureDir(outputDir);
        const savedFiles = [];

        for (const img of rawImages) {
            console.log(`\n── Image ${img.index + 1} of ${rawImages.length} ──`);

            // Download
            const rawBuffer = await downloadImage(img.url);

            // Process (resize, convert format)
            const { buffer, ext, meta } = await processImage(rawBuffer, opts);

            // Determine filename
            const fname = outputFilename
                ? (rawImages.length > 1 ? `${outputFilename}-${img.index + 1}.${ext}` : `${outputFilename}.${ext}`)
                : generateFilename(opts.prompt, img.index, ext);

            const outputPath = path.join(outputDir, fname);

            // Save
            fs.writeFileSync(outputPath, buffer);
            const relPath = path.relative(PROJECT_ROOT, outputPath);
            const fileSize = formatBytes(buffer.length);

            console.log(`   💾 Saved: ${relPath} (${fileSize})`);
            
            if (opts.info && meta) {
                console.log(`   📏 Original: ${meta.width}x${meta.height} ${meta.format}`);
            }
            
            if (img.revised_prompt) {
                console.log(`   📝 Revised prompt: "${img.revised_prompt}"`);
            }

            savedFiles.push({
                path: relPath,
                absolutePath: outputPath,
                size: buffer.length,
                url: img.url,
            });
        }

        // Summary
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║     ✅  Generation Complete                  ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log(`\n   Model: ${model.name}`);
        console.log(`   Images: ${savedFiles.length}`);
        savedFiles.forEach(f => {
            console.log(`   → ${f.path} (${formatBytes(f.size)})`);
        });

        // Output JSON to stdout for programmatic consumption (last line)
        const result = {
            success: true,
            model: model.id,
            prompt: opts.prompt,
            aspect: opts.aspect,
            files: savedFiles.map(f => ({
                path: f.path,
                absolutePath: f.absolutePath,
                size: f.size,
            })),
        };
        console.log('\n__RESULT_JSON__');
        console.log(JSON.stringify(result));

    } catch (err) {
        console.error(`\n❌ Error: ${err.message}`);
        if (err.response) {
            console.error(`   Status: ${err.response.status}`);
            console.error(`   Response: ${JSON.stringify(err.response.data).slice(0, 500)}`);
        }
        const errorResult = { success: false, error: err.message };
        console.log('\n__RESULT_JSON__');
        console.log(JSON.stringify(errorResult));
        process.exit(1);
    }
}

main();
