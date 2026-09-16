package com.example.intervialion.config;

import com.example.intervialion.model.Category;
import com.example.intervialion.model.Product;
import com.example.intervialion.model.SubCategory;
import com.example.intervialion.model.User;
import com.example.intervialion.service.CategoryRepository;
import com.example.intervialion.service.ProductRepository;
import com.example.intervialion.service.SubCategoryRepository;
import com.example.intervialion.service.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the H2 development database with realistic Category -> SubCategory -> Product
 * sample data, reusing the existing JPA entities and repositories.
 * Runs once: skipped if categories already exist beyond the original single seed row,
 * so it never duplicates data on repeated application restarts.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SubCategoryRepository subCategoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    private record ProductSeed(String name, String brand, String quality) {
    }

    private record SubCategorySeed(String name, List<ProductSeed> products) {
    }

    private record CategorySeed(String name, String description, List<SubCategorySeed> subCategories) {
    }

    @Override
    public void run(String... args) {
        List<User> sellers = getOrCreateSellers();

        if (categoryRepository.count() <= 1) {
            List<CategorySeed> seedData = buildSeedData();
            int sellerIndex = 0;
            for (CategorySeed categorySeed : seedData) {
                Category category = new Category();
                category.setName(categorySeed.name());
                category.setDescription(categorySeed.description());
                category = categoryRepository.save(category);

                for (SubCategorySeed subCategorySeed : categorySeed.subCategories()) {
                    SubCategory subCategory = new SubCategory();
                    subCategory.setName(subCategorySeed.name());
                    subCategory.setCategory(category);
                    subCategory = subCategoryRepository.save(subCategory);

                    for (ProductSeed productSeed : subCategorySeed.products()) {
                        Product product = new Product();
                        product.setName(productSeed.name());
                        product.setManufacturerNameOrBrand(productSeed.brand());
                        product.setQuality(productSeed.quality());
                        product.setSubCategory(subCategory);
                        product.setUser(sellers.get(sellerIndex % sellers.size()));
                        productRepository.save(product);
                        sellerIndex++;
                    }
                }
            }
        }

        // Additive, idempotent top-up: gives a handful of representative subcategories
        // a richer product count so the product grid has enough items to demo properly.
        // Safe to run on every startup - skips any product name that already exists.
        topUpFeaturedSubcategories(sellers);
    }

    private List<User> getOrCreateSellers() {
        List<String> usernames = List.of("noa_levi", "yossi_cohen", "michal_david");
        List<User> existing = userRepository.findAll().stream()
                .filter(u -> usernames.contains(u.getUsername()))
                .toList();
        if (existing.size() == usernames.size()) {
            return existing;
        }

        User noa = new User();
        noa.setUsername("noa_levi");
        noa.setPassword("seed1234");
        noa.setEmail("noa.levi@example.com");
        noa.setPhone(501234567);
        noa.setCity("תל אביב");
        noa.setAdress("רוטשילד 10");
        noa.setTimeToContac("בשעות הערב");

        User yossi = new User();
        yossi.setUsername("yossi_cohen");
        yossi.setPassword("seed1234");
        yossi.setEmail("yossi.cohen@example.com");
        yossi.setPhone(502345678);
        yossi.setCity("חיפה");
        yossi.setAdress("שדרות הנשיא 5");
        yossi.setTimeToContac("סופי שבוע");

        User michal = new User();
        michal.setUsername("michal_david");
        michal.setPassword("seed1234");
        michal.setEmail("michal.david@example.com");
        michal.setPhone(503456789);
        michal.setCity("ירושלים");
        michal.setAdress("יפו 22");
        michal.setTimeToContac("אחרי הצהריים");

        return userRepository.saveAll(List.of(noa, yossi, michal));
    }

    private void topUpFeaturedSubcategories(List<User> sellers) {
        record TopUp(String subCategoryName, List<ProductSeed> extraProducts) {
        }

        List<TopUp> topUps = List.of(
                new TopUp("טלפונים", List.of(
                        new ProductSeed("iPhone 14 Pro", "Apple", "כמו חדש"),
                        new ProductSeed("Pixel 7", "Google", "משומש"),
                        new ProductSeed("P40", "Huawei", "משומש")
                )),
                new TopUp("מחשבים", List.of(
                        new ProductSeed("מחשב נייד ThinkPad", "Lenovo", "משומש"),
                        new ProductSeed("MacBook Air", "Apple", "כמו חדש"),
                        new ProductSeed("מחשב נייח Aspire", "Acer", "משומש")
                )),
                new TopUp("אוזניות", List.of(
                        new ProductSeed("אוזניות Bluetooth", "JBL", "כמו חדש"),
                        new ProductSeed("AirPods", "Apple", "משומש"),
                        new ProductSeed("אוזניות אולפן", "Sennheiser", "כמו חדש")
                )),
                new TopUp("נעליים", List.of(
                        new ProductSeed("סניקרס", "Adidas", "כמו חדש"),
                        new ProductSeed("All Star", "Converse", "משומש"),
                        new ProductSeed("כפכפי קיץ", "Crocs", "חדש")
                )),
                new TopUp("בגדי גברים", List.of(
                        new ProductSeed("מכנסי ג'ינס", "Levi's", "משומש"),
                        new ProductSeed("סווטשירט", "Adidas", "כמו חדש"),
                        new ProductSeed("חליפה", "H&M", "משומש")
                )),
                new TopUp("קונסולות", List.of(
                        new ProductSeed("Xbox Series S", "Microsoft", "כמו חדש"),
                        new ProductSeed("Steam Deck", "Valve", "כמו חדש"),
                        new ProductSeed("PlayStation 4", "Sony", "משומש")
                )),
                new TopUp("רהיטים", List.of(
                        new ProductSeed("כורסא", "IKEA", "משומש"),
                        new ProductSeed("מיטה זוגית", "IKEA", "כמו חדש"),
                        new ProductSeed("ארון בגדים", "Home Center", "משומש")
                ))
        );

        int sellerIndex = 0;
        for (TopUp topUp : topUps) {
            SubCategory subCategory = subCategoryRepository.findByName(topUp.subCategoryName())
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (subCategory == null) {
                continue;
            }

            List<String> existingNames = productRepository.findBySubCategoryId(subCategory.getId())
                    .stream()
                    .map(Product::getName)
                    .toList();

            for (ProductSeed productSeed : topUp.extraProducts()) {
                if (existingNames.contains(productSeed.name())) {
                    continue;
                }
                Product product = new Product();
                product.setName(productSeed.name());
                product.setManufacturerNameOrBrand(productSeed.brand());
                product.setQuality(productSeed.quality());
                product.setSubCategory(subCategory);
                product.setUser(sellers.get(sellerIndex % sellers.size()));
                productRepository.save(product);
                sellerIndex++;
            }
        }
    }

    private List<CategorySeed> buildSeedData() {
        return List.of(
                new CategorySeed("לבית", "מוצרים לבית ולמשפחה", List.of(
                        new SubCategorySeed("רהיטים", List.of(
                                new ProductSeed("ספה תלת מושבית", "IKEA", "כמו חדש"),
                                new ProductSeed("שולחן אוכל עץ", "הבית שלי", "משומש")
                        )),
                        new SubCategorySeed("כלי מטבח", List.of(
                                new ProductSeed("סט סירים", "Tefal", "חדש"),
                                new ProductSeed("בלנדר", "Braun", "משומש")
                        )),
                        new SubCategorySeed("תאורה", List.of(
                                new ProductSeed("מנורת עמידה", "IKEA", "משומש"),
                                new ProductSeed("נברשת תקרה", "Philips", "כמו חדש")
                        )),
                        new SubCategorySeed("טקסטיל לבית", List.of(
                                new ProductSeed("שטיח סלון", "Home Center", "משומש"),
                                new ProductSeed("וילונות", "Castro", "כמו חדש")
                        ))
                )),
                new CategorySeed("אלקטרוניקה", "מכשירים וגאדג'טים אלקטרוניים", List.of(
                        new SubCategorySeed("טלפונים", List.of(
                                new ProductSeed("Galaxy S21", "Samsung", "משומש"),
                                new ProductSeed("Redmi Note 11", "Xiaomi", "כמו חדש")
                        )),
                        new SubCategorySeed("מחשבים", List.of(
                                new ProductSeed("מחשב נייד", "Dell", "משומש"),
                                new ProductSeed("מחשב נייח", "HP", "כמו חדש")
                        )),
                        new SubCategorySeed("אוזניות", List.of(
                                new ProductSeed("אוזניות אלחוטיות", "Sony", "כמו חדש"),
                                new ProductSeed("אוזניות גיימינג", "Logitech", "משומש")
                        )),
                        new SubCategorySeed("טלוויזיות", List.of(
                                new ProductSeed("טלוויזיה 43 אינץ'", "LG", "משומש")
                        )),
                        new SubCategorySeed("אביזרים", List.of(
                                new ProductSeed("מטען מהיר", "Anker", "חדש"),
                                new ProductSeed("כבל USB-C", "Belkin", "חדש")
                        ))
                )),
                new CategorySeed("אופנה", "בגדים, נעליים ואביזרי אופנה", List.of(
                        new SubCategorySeed("בגדי גברים", List.of(
                                new ProductSeed("מעיל חורף", "Zara", "משומש"),
                                new ProductSeed("חולצת פולו", "Nike", "כמו חדש")
                        )),
                        new SubCategorySeed("בגדי נשים", List.of(
                                new ProductSeed("שמלת ערב", "H&M", "משומש"),
                                new ProductSeed("ג'קט ג'ינס", "Levi's", "כמו חדש")
                        )),
                        new SubCategorySeed("נעליים", List.of(
                                new ProductSeed("נעלי ריצה", "Nike", "משומש"),
                                new ProductSeed("מגפי חורף", "Timberland", "כמו חדש")
                        )),
                        new SubCategorySeed("תיקים ואביזרים", List.of(
                                new ProductSeed("תיק גב", "Fjallraven", "משומש"),
                                new ProductSeed("חגורת עור", "Zara", "כמו חדש")
                        ))
                )),
                new CategorySeed("ספרים", "ספרי קריאה, לימוד וילדים", List.of(
                        new SubCategorySeed("ספרות יפה", List.of(
                                new ProductSeed("סדרת הארי פוטר", "Bloomsbury", "משומש"),
                                new ProductSeed("רומן ישראלי", "כתר", "כמו חדש")
                        )),
                        new SubCategorySeed("ספרי לימוד", List.of(
                                new ProductSeed("ספר לימוד אנגלית", "Oxford", "משומש"),
                                new ProductSeed("ספר מתמטיקה לתיכון", "מטח", "כמו חדש")
                        )),
                        new SubCategorySeed("ספרי ילדים", List.of(
                                new ProductSeed("ספרי פעוטות מאוירים", "כנרת זמורה", "כמו חדש")
                        ))
                )),
                new CategorySeed("ילדים", "צעצועים, ציוד ובגדי ילדים", List.of(
                        new SubCategorySeed("צעצועים", List.of(
                                new ProductSeed("לגו סיטי", "LEGO", "כמו חדש"),
                                new ProductSeed("בובת דובי", "Fisher-Price", "משומש")
                        )),
                        new SubCategorySeed("ציוד תינוקות", List.of(
                                new ProductSeed("עגלת תינוק", "Chicco", "משומש"),
                                new ProductSeed("כיסא אוכל", "IKEA", "כמו חדש")
                        )),
                        new SubCategorySeed("בגדי ילדים", List.of(
                                new ProductSeed("סט בגדים לתינוק", "Carter's", "כמו חדש")
                        ))
                )),
                new CategorySeed("ספורט", "ציוד ספורט וכושר", List.of(
                        new SubCategorySeed("כושר ביתי", List.of(
                                new ProductSeed("משקולות יד", "Reebok", "משומש"),
                                new ProductSeed("מזרן יוגה", "Nike", "כמו חדש")
                        )),
                        new SubCategorySeed("אופניים", List.of(
                                new ProductSeed("אופני הרים", "Trek", "משומש"),
                                new ProductSeed("אופני עיר", "Giant", "כמו חדש")
                        )),
                        new SubCategorySeed("קמפינג", List.of(
                                new ProductSeed("אוהל שני מקומות", "Coleman", "משומש"),
                                new ProductSeed("שק שינה", "The North Face", "כמו חדש")
                        ))
                )),
                new CategorySeed("משחקים", "משחקי וידאו, קונסולות ומשחקי קופסה", List.of(
                        new SubCategorySeed("קונסולות", List.of(
                                new ProductSeed("PlayStation 5", "Sony", "כמו חדש"),
                                new ProductSeed("Nintendo Switch", "Nintendo", "משומש")
                        )),
                        new SubCategorySeed("משחקי וידאו", List.of(
                                new ProductSeed("FIFA 23", "EA Sports", "משומש"),
                                new ProductSeed("The Legend of Zelda", "Nintendo", "כמו חדש")
                        )),
                        new SubCategorySeed("משחקי קופסה", List.of(
                                new ProductSeed("קטאן", "Catan", "כמו חדש"),
                                new ProductSeed("מונופול", "Hasbro", "משומש")
                        ))
                )),
                new CategorySeed("כלי עבודה", "כלי עבודה לבית ולגינה", List.of(
                        new SubCategorySeed("כלי חשמל", List.of(
                                new ProductSeed("מברגה חשמלית", "Bosch", "משומש"),
                                new ProductSeed("משחזת זווית", "Makita", "כמו חדש")
                        )),
                        new SubCategorySeed("כלי יד", List.of(
                                new ProductSeed("סט מברגים", "Stanley", "כמו חדש"),
                                new ProductSeed("פטיש", "Black+Decker", "משומש")
                        )),
                        new SubCategorySeed("כלי גינון", List.of(
                                new ProductSeed("מזמרה", "Fiskars", "כמו חדש"),
                                new ProductSeed("מריצה", "Keter", "משומש")
                        ))
                )),
                new CategorySeed("שונות", "כל מה שלא נכנס לקטגוריה אחרת", List.of(
                        new SubCategorySeed("כלי נגינה", List.of(
                                new ProductSeed("גיטרה אקוסטית", "Yamaha", "משומש"),
                                new ProductSeed("קלידים", "Casio", "כמו חדש")
                        )),
                        new SubCategorySeed("אמנות ויצירה", List.of(
                                new ProductSeed("סט צבעי אקריליק", "Winsor & Newton", "כמו חדש")
                        )),
                        new SubCategorySeed("אוספים", List.of(
                                new ProductSeed("אוסף בולים ישן", "לא ידוע", "משומש")
                        ))
                ))
        );
    }
}
