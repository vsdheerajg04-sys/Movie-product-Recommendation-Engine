package com.recommendation.engine.repository;

import com.recommendation.engine.model.Product;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class ProductDataStore {

    private final Map<String, Product> productMap = new ConcurrentHashMap<>();

    public ProductDataStore() {
        initProducts();
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(productMap.values());
    }

    public Optional<Product> getProductById(String id) {
        return Optional.ofNullable(productMap.get(id));
    }

    public List<Product> getTrendingProducts(int limit) {
        return productMap.values().stream()
                .sorted((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Set<String> getAllCategories() {
        Set<String> categories = new TreeSet<>();
        for (Product p : productMap.values()) {
            categories.add(p.getCategory());
        }
        return categories;
    }

    private void initProducts() {
        addProduct("p-1", "Sony WH-1000XM5 Wireless Headphones", "Sony", "Audio", "Noise-Cancelling Headphones",
                399.99, 4.8, 12500, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                "Industry-leading noise canceling with two processors and 8 microphones. Magnificent audio quality, crystal-clear hands-free calling, and 30-hour battery life.",
                Map.of("Battery", "30 hours", "Connectivity", "Bluetooth 5.2", "Weight", "250g", "Driver", "30mm Carbon Fiber"),
                98.4, List.of("headphones", "anc", "audio", "sony", "wireless", "premium", "bluetooth"));

        addProduct("p-2", "Apple MacBook Pro 16\" M3 Max", "Apple", "Computing", "Laptops",
                3499.00, 4.9, 8200, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
                "Built for extreme workflows with 16-core CPU, up to 40-core GPU, Liquid Retina XDR display, up to 128GB unified memory, and up to 22 hours battery life.",
                Map.of("Processor", "Apple M3 Max", "RAM", "36GB Unified", "Storage", "1TB SSD", "Display", "16.2-inch Liquid Retina XDR 120Hz"),
                99.1, List.of("laptop", "apple", "macbook", "m3 max", "developer", "creator", "retina", "computing"));

        addProduct("p-3", "PlayStation 5 Pro", "Sony Interactive", "Gaming", "Consoles",
                699.99, 4.8, 15400, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
                "PlayStation Spectral Super Resolution (PSSR) AI upscaling, advanced ray tracing, 60fps high fidelity gaming, 2TB SSD storage, and DualSense haptic feedback.",
                Map.of("Storage", "2TB Custom NVMe SSD", "GPU", "16.7 TFLOPs RDNA", "Output", "4K 120Hz / 8K", "Audio", "Tempest 3D AudioTech"),
                97.5, List.of("gaming", "console", "ps5", "sony", "playstation", "4k", "ray-tracing"));

        addProduct("p-4", "Samsung Galaxy S24 Ultra", "Samsung", "Mobile", "Smartphones",
                1299.99, 4.8, 18900, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
                "Galaxy AI features, Titanium frame, 200MP camera system with 5x optical zoom, Snapdragon 8 Gen 3, and integrated S-Pen stylus with Dynamic AMOLED 2X display.",
                Map.of("Screen", "6.8 inch QHD+ AMOLED 120Hz", "Camera", "200MP + 50MP + 12MP + 10MP", "Battery", "5000mAh", "Processor", "Snapdragon 8 Gen 3"),
                96.8, List.of("smartphone", "samsung", "galaxy", "ai", "android", "camera", "titanium", "s-pen"));

        addProduct("p-5", "Apple Watch Ultra 2", "Apple", "Wearables", "Smartwatches",
                799.00, 4.9, 9400, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
                "The most rugged and capable Apple Watch. Powered by the S9 SiP with 3000-nit brightest display, precision dual-frequency GPS, and up to 72 hours in Low Power Mode.",
                Map.of("Case", "49mm Titanium", "Display", "3000 nits Always-On Retina", "Water Resistance", "100m / Dive certified 40m", "Battery", "36-72 hours"),
                95.2, List.of("smartwatch", "apple", "fitness", "gps", "titanium", "outdoor", "diving", "wearable"));

        addProduct("p-6", "Keychron Q1 Pro Wireless Custom Mechanical Keyboard", "Keychron", "Computing", "Keyboards",
                199.99, 4.7, 4300, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
                "Full CNC aluminum body, 75% layout, QMK/VIA programmable, hot-swappable switches, sound-absorbing foam, and wireless Bluetooth + wired connectivity.",
                Map.of("Layout", "75%", "Switches", "K Pro Banana Tactile Hot-swap", "Body", "CNC Aluminum", "Connectivity", "Bluetooth 5.1 + Type-C"),
                92.0, List.of("keyboard", "mechanical", "custom", "keychron", "aluminum", "qmk", "tactile"));

        addProduct("p-7", "Sony A7 IV Full-Frame Mirrorless Camera", "Sony", "Photography", "Cameras",
                2498.00, 4.9, 6100, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
                "33MP full-frame Exmor R sensor, real-time eye AF for humans/animals/birds, 4K 60p 10-bit 4:2:2 video recording, 5-axis image stabilization.",
                Map.of("Sensor", "33MP Full-Frame BSI CMOS", "Video", "4K 60p 10-bit 4:2:2", "Autofocus", "759-point Phase Detection", "Stabilization", "5.5 stops IBIS"),
                94.6, List.of("camera", "sony", "full-frame", "photography", "mirrorless", "video", "4k"));

        addProduct("p-8", "Sonos Arc Premium Smart Soundbar", "Sonos", "Audio", "Home Theater",
                899.00, 4.8, 11200, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
                "Bring all your entertainment to life with breathtakingly realistic sound and Dolby Atmos. Supports Apple AirPlay 2, multiroom audio, and voice control.",
                Map.of("Channels", "Dolby Atmos 5.0.2", "Drivers", "11 high-performance drivers", "Connectivity", "HDMI eARC, Optical, Wi-Fi", "Voice", "Amazon Alexa, Sonos Voice"),
                93.8, List.of("audio", "soundbar", "dolby atmos", "sonos", "home theater", "speakers", "tv audio"));

        addProduct("p-9", "Logitech MX Master 3S Wireless Mouse", "Logitech", "Computing", "Mice",
                99.99, 4.8, 32000, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
                "Quiet clicks, 8K DPI any-surface tracking (including glass), MagSpeed electromagnetic scrolling up to 1000 lines/sec, and ergonomic thumb rest.",
                Map.of("DPI", "8000 DPI Darkfield", "Battery", "70 days rechargeable", "Buttons", "7 customizable buttons", "Scroll", "MagSpeed Electromagnetic"),
                96.0, List.of("mouse", "logitech", "mx master", "ergonomic", "productivity", "office", "bluetooth"));

        addProduct("p-10", "Dyson V15 Detect Cordless Vacuum", "Dyson", "Smart Home", "Home Appliances",
                749.99, 4.7, 7800, "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80",
                "Laser illumination reveals microscopic dust on hard floors. Piezo sensor measures and counts dust particles, automatically increasing suction when needed.",
                Map.of("Suction Power", "230 AW", "Run Time", "Up to 60 mins", "Filtration", "Whole-machine HEPA 99.99%", "Bin Volume", "0.77 L"),
                91.5, List.of("smart home", "vacuum", "dyson", "cordless", "appliances", "cleaning", "laser"));

        addProduct("p-11", "ASUS ROG Swift 32\" 4K 240Hz OLED Gaming Monitor", "ASUS", "Gaming", "Monitors",
                1299.00, 4.9, 3900, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
                "32-inch 4K UHD QD-OLED panel, 240Hz refresh rate, 0.03ms response time, custom heatsink, Dolby Vision, and G-SYNC compatibility.",
                Map.of("Resolution", "3840 x 2160 (4K)", "Refresh Rate", "240Hz", "Panel", "3rd Gen QD-OLED", "Response Time", "0.03ms (GtG)"),
                95.8, List.of("gaming", "monitor", "oled", "4k", "240hz", "asus", "rog", "display"));

        addProduct("p-12", "Bose QuietComfort Ultra Earbuds", "Bose", "Audio", "True Wireless Earbuds",
                299.00, 4.7, 8600, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
                "World-class noise cancellation, groundbreaking spatialized audio for more immersive listening, and CustomTune sound calibration to your ear shape.",
                Map.of("Battery", "6 hours (24h with case)", "ANC", "CustomTune Active Noise Cancelling", "Water Resistance", "IPX4", "Audio", "Bose Immersive Audio"),
                93.2, List.of("earbuds", "bose", "audio", "noise-cancelling", "spatial audio", "wireless", "anc"));

        addProduct("p-13", "DJI Mini 4 Pro Drone", "DJI", "Photography", "Drones",
                759.00, 4.8, 5400, "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80",
                "Under 249g ultralight foldable drone, Omnidirectional obstacle sensing, 4K/60fps HDR true vertical shooting, 20km FHD video transmission, 34-min flight time.",
                Map.of("Weight", "249g", "Video", "4K 60fps HDR, 4K 100fps Slow-mo", "Range", "20km (DJI O4)", "Flight Time", "34 minutes"),
                94.0, List.of("drone", "dji", "camera", "aerial", "4k", "travel", "quadcopter"));

        addProduct("p-14", "Kindle Colorsoft Signature Edition", "Amazon", "Electronics", "E-Readers",
                279.99, 4.6, 6200, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                "The first color Kindle with 7\" Colorsoft display, glare-free page turns, weeks of battery life, auto-adjusting front light, and 32GB storage.",
                Map.of("Display", "7\" Colorsoft Paper-like Display", "Storage", "32GB", "Battery", "Up to 8 weeks", "Waterproof", "IPX8"),
                89.4, List.of("kindle", "ereader", "books", "color", "amazon", "reading", "paperwhite"));

        addProduct("p-15", "Philips Hue Smart LED Starter Kit", "Philips Hue", "Smart Home", "Lighting",
                199.99, 4.8, 14200, "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
                "16 million colors and shades of white light. Syncs with Spotify, games, and films. Includes 4 White & Color Ambiance smart bulbs and Hue Bridge.",
                Map.of("Colors", "16 Million Colors", "Protocol", "Zigbee & Bluetooth", "Compatibility", "Apple HomeKit, Alexa, Google Home", "Power", "75W equivalent"),
                92.8, List.of("smart home", "lighting", "philips hue", "rgb", "automation", "homekit", "alexa"));
        addProduct("p-16", "Nintendo Switch OLED Model", "Nintendo", "Gaming", "Consoles",
                349.99, 4.8, 22000, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&auto=format&fit=crop&q=80",
                "7-inch vivid OLED screen, wide adjustable stand, wired LAN port dock, 64GB of internal storage, and enhanced audio in handheld and tabletop modes.",
                Map.of("Display", "7.0-inch OLED 720p", "Storage", "64GB internal", "Battery", "4.5 to 9 hours", "Modes", "TV, Tabletop, Handheld"),
                94.8, List.of("nintendo", "switch", "oled", "gaming", "zelda", "mario", "handheld"));

        addProduct("p-17", "Apple iPad Pro 13\" M4", "Apple", "Computing", "Tablets",
                1299.00, 4.9, 5300, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
                "Outrageously thin design with Ultra Retina XDR OLED display, breakthrough Apple M4 chip performance, and next-generation Apple Pencil Pro support.",
                Map.of("Display", "13.0-inch Ultra Retina XDR Tandem OLED", "Processor", "Apple M4 9-Core", "Storage", "256GB SSD", "Thickness", "5.1 mm"),
                97.2, List.of("apple", "ipad", "tablet", "m4", "retina", "oled", "procreate", "computing"));

        addProduct("p-18", "Elgato Stream Deck MK.2", "Elgato", "Computing", "Streaming",
                149.99, 4.8, 16500, "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
                "15 customizable LCD keys to control apps and platforms like OBS, Twitch, YouTube, and Spotify with one-touch tactile operation.",
                Map.of("Keys", "15 customizable LCD keys", "Interface", "USB 2.0", "Support", "Windows / macOS", "Plate", "Detachable Faceplate"),
                91.0, List.of("elgato", "stream deck", "streaming", "creator", "macros", "twitch", "youtube"));

        addProduct("p-19", "GoPro HERO12 Black Action Camera", "GoPro", "Photography", "Cameras",
                399.99, 4.7, 7200, "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80",
                "Incredible 5.3K60 video, HDR video & photo, HyperSmooth 6.0 stabilization with 360-degree Horizon Lock, and rugged waterproof design to 33ft.",
                Map.of("Video", "5.3K 60fps / 4K 120fps", "Stabilization", "HyperSmooth 6.0", "Waterproof", "10m (33ft) without housing", "Battery", "Enduro Battery"),
                93.0, List.of("gopro", "action camera", "4k", "5k", "waterproof", "hypersmooth", "travel", "sports"));

        addProduct("p-20", "Meta Quest 3 Mixed Reality VR Headset", "Meta", "Gaming", "VR",
                499.99, 4.8, 9800, "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop&q=80",
                "Breakthrough mixed reality transforms your home into an immersive gaming playground with 4K+ Infinite Display and Snapdragon XR2 Gen 2 power.",
                Map.of("Display", "4K+ Infinite Display (2064x2208 per eye)", "Processor", "Snapdragon XR2 Gen 2", "Pass-through", "High-res Full Color", "Audio", "3D Spatial"),
                96.4, List.of("vr", "meta quest", "mixed reality", "gaming", "virtual reality", "4k", "headset"));
    }

    public synchronized Product addCustomProduct(Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId("p-" + (productMap.size() + 1) + "-" + UUID.randomUUID().toString().substring(0, 4));
        }
        if (product.getImageUrl() == null || product.getImageUrl().trim().isEmpty()) {
            product.setImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80");
        }
        if (product.getTrendingScore() == 0.0) {
            product.setTrendingScore(85.0 + Math.random() * 10);
        }
        if (product.getSpecs() == null) {
            product.setSpecs(new HashMap<>());
        }
        productMap.put(product.getId(), product);
        return product;
    }

    private void addProduct(String id, String name, String brand, String category, String subcategory,
                            double price, double rating, int reviewCount, String imageUrl,
                            String description, Map<String, String> specs, double trendingScore,
                            List<String> tags) {
        Product p = new Product(id, name, brand, category, subcategory, price, rating, reviewCount, imageUrl, description, specs, trendingScore, tags);
        productMap.put(id, p);
    }
}
