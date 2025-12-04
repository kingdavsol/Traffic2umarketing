# Photo Analysis Setup Guide
**Feature:** AI-Powered Product Photo Analysis
**Status:** Implementation Complete - Requires API Key

---

## What Was Implemented

AI photo analysis using **OpenAI Vision API (GPT-4 Vision)** that automatically:
- ✅ Analyzes product photos
- ✅ Generates product title
- ✅ Creates detailed product description (2-3 paragraphs)
- ✅ Suggests fair market price
- ✅ Identifies product category
- ✅ Determines condition (new, like-new, good, fair, poor)
- ✅ Extracts brand and model information
- ✅ Lists key product features

---

## Files Created/Modified

### New Files:
1. `backend/src/controllers/photoController.ts` - AI photo analysis logic
2. `backend/.env.example` - Environment variable template

### Modified Files:
1. `backend/src/routes/photo.routes.ts` - Updated to use new controller

---

## Setup Requirements

### 1. OpenAI API Key Required

You need an **OpenAI API key** with access to GPT-4 Vision API.

**Get an API key:**
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

**Pricing:**
- GPT-4 Vision: ~$0.01 per image analysis
- Very affordable for this use case

### 2. Add API Key to VPS

SSH to your VPS and create/update the backend `.env` file:

```bash
ssh root@72.60.114.234
cd /var/www/quicksell.monster/backend
nano .env
```

Add this line (replace with your actual key):
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

Save and exit (Ctrl+X, Y, Enter).

### 3. Deploy Backend

After adding the API key:

```bash
cd /var/www/quicksell.monster
git pull origin quicksell
docker compose build backend
docker compose up -d backend
docker logs quicksell-backend --tail=20
```

---

## How It Works

### User Experience:
1. User uploads a product photo (e.g., Logitech Mouse)
2. Frontend sends photo as base64 to `/api/v1/photos/analyze`
3. Backend calls OpenAI Vision API
4. AI analyzes the image and extracts product details
5. Structured data returned to frontend
6. Form auto-fills with AI-generated content
7. User can review/edit before creating listing

### API Response Format:
```json
{
  "success": true,
  "data": {
    "title": "Logitech MX Master 3 Wireless Mouse - Black",
    "description": "Professional wireless mouse featuring...",
    "suggestedPrice": "79.99",
    "category": "Electronics",
    "condition": "good",
    "brand": "Logitech",
    "model": "MX Master 3",
    "features": [
      "Ergonomic design",
      "MagSpeed scrolling",
      "Multi-device connectivity"
    ]
  },
  "statusCode": 200
}
```

---

## Testing Photo Analysis

### With API Key Configured:

```bash
# Test with a photo (from your local machine)
curl -X POST https://quicksell.monster/api/v1/photos/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

### Without API Key:
You'll get an error:
```json
{
  "success": false,
  "error": "AI service not configured. Please contact administrator.",
  "statusCode": 500
}
```

---

## Error Handling

The implementation handles common errors:

1. **No API key configured:**
   - Returns helpful error message
   - Logs to backend for admin

2. **OpenAI quota exceeded:**
   - Returns specific 503 error
   - User sees: "AI service quota exceeded. Please try again later."

3. **Invalid image format:**
   - Returns 400 Bad Request
   - User sees: "No image provided"

4. **AI parsing errors:**
   - Logs the issue
   - Returns 500 with error details

---

## Cost Considerations

**OpenAI API Costs:**
- GPT-4 Vision: ~$0.01-0.03 per image
- 100 photo analyses = ~$1-3
- 1,000 photo analyses = ~$10-30

**Recommendations:**
1. Monitor usage in OpenAI dashboard
2. Set spending limits in OpenAI account
3. Consider caching common products
4. Add rate limiting if needed

---

## Alternative: Free Tier Options

If you want to test without costs first, you could:

1. **Use a mock response** (temporary):
   - Return fake data for testing
   - Good for frontend development

2. **Use free image recognition APIs** (limited):
   - Google Cloud Vision (free tier)
   - Clarifai (limited free tier)
   - But these won't generate descriptions as well as GPT-4

3. **Use GPT-3.5-turbo-vision** (when available):
   - Cheaper than GPT-4
   - Slightly lower quality

---

## Next Steps

**To activate photo analysis:**

1. ✅ Code is already committed to GitHub (commit: fe47e28)
2. ⏳ Get OpenAI API key from https://platform.openai.com/api-keys
3. ⏳ Add key to `/var/www/quicksell.monster/backend/.env`
4. ⏳ Rebuild backend: `docker compose build backend && docker compose up -d backend`
5. ✅ Test by uploading a photo in the app

**After setup:**
- Users can upload product photos
- AI automatically fills in listing details
- Users review and edit as needed
- One-click listing creation

---

## Support

If you encounter issues:
1. Check backend logs: `docker logs quicksell-backend --tail=50`
2. Verify API key is set: `docker exec quicksell-backend env | grep OPENAI`
3. Test API key with OpenAI directly
4. Check OpenAI account for quota/billing issues

---

**Status:** Ready to deploy - Just need API key!
