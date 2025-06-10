import json
import requests
from uuid import uuid4
from bs4 import BeautifulSoup
import os

# ✅ Hardcoded absolute path to your JSON file
PRODUCTS_FILE = r"C:\Users\jrbri\Documents\git\AmazonAffiliateApp\client\build\products.json"

def load_products():
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_products(products):
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(products)} products to {PRODUCTS_FILE}")

def scrape_amazon_product(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    title_tag = soup.find(id="productTitle")
    title = title_tag.get_text(strip=True) if title_tag else "Untitled"

    price_tag = soup.find("span", class_="a-offscreen") or soup.select_one("span.a-price .a-offscreen")
    price = price_tag.get_text(strip=True) if price_tag else "Price not found"

    img_tag = soup.find(id="landingImage")
    image = img_tag["src"] if img_tag and img_tag.has_attr("src") else "https://via.placeholder.com/200x200.png?text=No+Image"

    return {
        "title": title,
        "price": price,
        "image": image,
        "url": url,
        "review": "No review generated."
    }

def add_product():
    url = input("Paste your Amazon affiliate product URL: ").strip()
    if not url.startswith("http"):
        print("❌ Invalid URL. Please enter a valid Amazon product link.")
        return

    print("🔍 Scraping product details...")
    try:
        product_data = scrape_amazon_product(url)
        products = load_products()
        new_id = uuid4().hex[:8]
        product_data["id"] = new_id
        products[new_id] = product_data
        save_products(products)
        print(f"✅ Added product: {product_data['title']}")
    except Exception as e:
        print("❌ Failed to add product.")
        print(e)

if __name__ == "__main__":
    add_product()
