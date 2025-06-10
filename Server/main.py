from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bs4 import BeautifulSoup
import requests
from uuid import uuid4
import json
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCTS_FILE = "products.json"
products = {}

# Load/save
def load_products():
    global products
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, "r") as f:
            products = json.load(f)

def save_products():
    with open(PRODUCTS_FILE, "w") as f:
        json.dump(products, f, indent=2)

load_products()

class ProductRequest(BaseModel):
    url: str

HUGGINGFACE_TOKEN = "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"
HUGGINGFACE_MODEL_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"

def generate_review(title, price, url):
    prompt = (
        f"Write a friendly UK-market product review as if I'm recommending it to a friend. "
        f"The product is called: '{title}' and it's currently listed at {price}. "
        f"You can buy it from this URL: {url}. "
        f"Mention its usefulness and tone it like a personal experience."
    )

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_TOKEN}",
        "Content-Type": "application/json"
    }
    

    try:
        response = requests.post(
            HUGGINGFACE_MODEL_URL,
            headers=headers,
            json={"inputs": prompt},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        if isinstance(data, list) and "generated_text" in data[0]:
            return data[0]["generated_text"].strip()
        elif isinstance(data, dict) and "generated_text" in data:
            return data["generated_text"].strip()
    except Exception as e:
        print("Review generation error:", e)

    return "Review generation failed."

@app.post("/add-product")
def add_product(data: ProductRequest):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }
    try:
        response = requests.get(data.url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        title_tag = soup.find(id="productTitle")
        title = title_tag.get_text(strip=True) if title_tag else "Untitled"

        price_tag = soup.find("span", class_="a-offscreen") or soup.select_one("span.a-price .a-offscreen")
        price = price_tag.get_text(strip=True) if price_tag else "Price not found"

        img_tag = soup.find(id="landingImage")
        img = img_tag["src"] if img_tag and img_tag.has_attr("src") else "https://via.placeholder.com/200x200.png?text=No+Image"

        review = generate_review(title, price, data.url)

        product_id = str(uuid4())[:8]
        products[product_id] = {
            "id": product_id,
            "title": title,
            "image": img,
            "price": price,
            "url": data.url,
            "review": review,
        }

        save_products()
        return products[product_id]

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": "Failed to parse product", "detail": str(e)}

@app.get("/product/{product_id}")
def get_product(product_id: str):
    return products.get(product_id, {"error": "Product not found"})

@app.get("/products")
def get_all_products():
    return list(products.values())

@app.delete("/product/{product_id}")
def delete_product(product_id: str):
    if product_id not in products:
        raise HTTPException(status_code=404, detail="Product not found")
    del products[product_id]
    save_products()
    return {"success": True, "id": product_id}
