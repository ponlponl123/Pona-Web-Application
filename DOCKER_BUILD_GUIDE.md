# Docker Build Scripts for Pona Web Application

## Quick Test (No Sharp - Fastest Build)

This version will build quickly but image processing will be disabled:

```powershell
docker build -f .\Dockerfile-Bun-NoSharp -t pona-webapp:no-sharp .
docker run -p 3000:3000 pona-webapp:no-sharp
```

## Fixed Sharp Version (Recommended)

This version attempts to install Sharp with better error handling:

```powershell
docker build -f .\Dockerfile-Bun-Fixed -t pona-webapp:with-sharp .
docker run -p 3000:3000 pona-webapp:with-sharp
```

## Original Fixed Version

This is the updated original Dockerfile-Bun:

```powershell
docker build -f .\Dockerfile-Bun -t pona-webapp:original-fixed .
docker run -p 3000:3000 pona-webapp:original-fixed
```

## Testing the Image Proxy

Once any container is running, you can test the image proxy:

### Test 1: Basic proxy (should work with all versions)

```
http://localhost:3000/api/proxy/image?r=https://httpbin.org/image/png
```

### Test 2: With image processing (only works if Sharp is available)

```
http://localhost:3000/api/proxy/image?r=https://httpbin.org/image/png&s=200&blur=2
```

### Test 3: Using the test script

```powershell
npm run test:image-proxy
```

## Troubleshooting

If you see errors like:

- "Sharp module not available" → This is expected with the no-sharp version
- "Image processing requested but no suitable processor available" → Sharp failed to load, but the proxy still works for basic functionality
- "libstdc++.so.6: cannot open shared object file" → Try the Dockerfile-Bun-Fixed version

## Performance Notes

- **Dockerfile-Bun-NoSharp**: Fastest build, no image processing
- **Dockerfile-Bun-Fixed**: Moderate build time, Sharp with fallbacks
- **Dockerfile-Bun**: Original with conflicts removed

Choose based on your needs:

- For development/testing: Use no-sharp version
- For production with image processing: Use fixed version
- For production without image processing: Use no-sharp version
