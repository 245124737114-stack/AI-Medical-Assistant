"""Curated educational health library backed by MedlinePlus, WHO, and CDC sources."""

from typing import Dict, List, Optional

CATEGORIES: List[str] = [
    "General Health",
    "Nutrition",
    "Fitness and Exercise",
    "Preventive Healthcare",
    "Common Health Conditions",
    "Mental Wellness",
]

ARTICLES: List[Dict] = [
    {
        "id": "understanding-lab-results",
        "title": "How to Understand Your Laboratory Test Results",
        "category": "General Health",
        "reading_time": "5 min read",
        "summary": "Learn what reference ranges mean, why individual lab values vary, and what questions to ask your doctor when reviewing bloodwork.",
        "key_points": [
            "Reference ranges represent values seen in most healthy people, typically covering 95% of a tested population.",
            "A slightly high or low flag does not automatically indicate disease—hydration, medications, fasting status, and lab methods all matter.",
            "Always interpret lab results alongside your symptoms, medical history, and clinician guidance.",
        ],
        "sections": [
            {
                "heading": "What Is a Reference Range?",
                "body": "Laboratories establish reference intervals based on large groups of healthy volunteers. Because instruments and chemical assays differ between facilities, your reference range should always come from the exact lab that processed your sample.",
            },
            {
                "heading": "Preparing Questions for Your Visit",
                "body": "Ask your clinician whether a value represents a meaningful trend compared to past tests, whether follow-up testing is needed, and how diet or timing may have influenced the result.",
            },
        ],
        "when_to_seek_care": "Contact your healthcare provider promptly if your lab portal flags critical values or if you experience new or worsening symptoms alongside abnormal results.",
        "sources": [
            {
                "name": "MedlinePlus — How to Understand Your Lab Results",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/",
            },
            {
                "name": "MedlinePlus — Medical Tests Directory",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/lab-tests/",
            },
        ],
    },
    {
        "id": "hydration-and-sleep-basics",
        "title": "Foundations of Daily Health: Sleep, Hydration, and Vital Signs",
        "category": "General Health",
        "reading_time": "4 min read",
        "summary": "Understand how consistent sleep hygiene, daily fluid intake, and routine vital sign monitoring support overall wellness.",
        "key_points": [
            "Most adults benefit from 7 to 9 hours of quality sleep per night.",
            "Monitoring blood pressure and resting heart rate trends helps spot early cardiovascular changes.",
            "Keeping an updated medication and allergy list improves safety during medical appointments.",
        ],
        "sections": [
            {
                "heading": "Why Sleep Matters",
                "body": "Consistent sleep schedules support immune regulation, glucose metabolism, memory consolidation, and mood stability.",
            },
            {
                "heading": "Tracking Personal Baselines",
                "body": "Knowing your typical blood pressure, heart rate, and body temperature makes it easier for clinicians to assess changes when you feel unwell.",
            },
        ],
        "when_to_seek_care": "Seek medical care if you experience persistent insomnia, daytime breathing pauses, unexplained fainting, or sustained high blood pressure readings.",
        "sources": [
            {
                "name": "CDC — About Sleep and Your Health",
                "organization": "CDC",
                "url": "https://www.cdc.gov/sleep/about/index.html",
            },
            {
                "name": "MedlinePlus — Vital Signs",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/ency/article/002341.htm",
            },
        ],
    },
    {
        "id": "balanced-healthy-diet",
        "title": "Building Balanced Meals for Long-Term Health",
        "category": "Nutrition",
        "reading_time": "5 min read",
        "summary": "Evidence-based guidance on whole foods, dietary fiber, healthy fats, and limiting added sugars and excess sodium.",
        "key_points": [
            "WHO recommends eating at least 400g (about 5 portions) of fruits and vegetables daily.",
            "Keep free sugars below 10% of total energy intake and sodium below 2g/day (about 5g of salt).",
            "Choose unsaturated fats (olive oil, nuts, fish) over saturated and industrial trans fats.",
        ],
        "sections": [
            {
                "heading": "Balanced Plate Approach",
                "body": "Fill half your plate with colorful non-starchy vegetables and fruits, one quarter with whole grains or starchy legumes, and one quarter with lean or plant-based proteins.",
            },
            {
                "heading": "Reading Nutrition Labels",
                "body": "Check serving sizes, added sugars, dietary fiber, and % Daily Value for sodium when comparing packaged foods.",
            },
        ],
        "when_to_seek_care": "Consult a physician or registered dietitian if you have kidney disease, diabetes, celiac disease, food allergies, or unintentional weight loss before making major dietary changes.",
        "sources": [
            {
                "name": "WHO — Healthy Diet Fact Sheet",
                "organization": "World Health Organization (WHO)",
                "url": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
            },
            {
                "name": "CDC — Healthy Eating for a Healthy Weight",
                "organization": "CDC",
                "url": "https://www.cdc.gov/healthy-weight-growth/healthy-eating/meals-snacks.html",
            },
        ],
    },
    {
        "id": "cholesterol-and-heart-nutrition",
        "title": "Dietary Fats, Cholesterol, and Heart-Smart Nutrition",
        "category": "Nutrition",
        "reading_time": "4 min read",
        "summary": "Learn the difference between LDL, HDL, and triglycerides, and how soluble fiber and healthy fats support lipid health.",
        "key_points": [
            "Soluble fiber from oats, beans, lentils, and apples helps lower LDL cholesterol absorption.",
            "Omega-3 fatty acids in fatty fish, walnuts, and flaxseed support cardiovascular health.",
            "Lipid panels are often interpreted alongside age, blood pressure, and overall cardiovascular risk.",
        ],
        "sections": [
            {
                "heading": "Understanding Cholesterol Numbers",
                "body": "Low-density lipoprotein (LDL) carries cholesterol to arteries, while high-density lipoprotein (HDL) helps remove excess cholesterol from the bloodstream.",
            },
            {
                "heading": "Practical Food Swaps",
                "body": "Swap butter and processed meats for extra-virgin olive oil, avocados, legumes, and grilled fish.",
            },
        ],
        "when_to_seek_care": "Discuss your lipid panel targets with a clinician, especially if you have a family history of early heart disease or diabetes.",
        "sources": [
            {
                "name": "MedlinePlus — Cholesterol Levels",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/lab-tests/cholesterol-levels/",
            },
            {
                "name": "CDC — Preventing High Cholesterol",
                "organization": "CDC",
                "url": "https://www.cdc.gov/cholesterol/prevention/index.html",
            },
        ],
    },
    {
        "id": "who-physical-activity-guidelines",
        "title": "Physical Activity Guidelines for Adults and Older Adults",
        "category": "Fitness and Exercise",
        "reading_time": "5 min read",
        "summary": "Review global weekly recommendations for aerobic exercise, muscle strengthening, and reducing sedentary time.",
        "key_points": [
            "Aim for 150 to 300 minutes of moderate-intensity aerobic activity (or 75 to 150 minutes vigorous) per week.",
            "Include muscle-strengthening activities involving major muscle groups on 2 or more days a week.",
            "Every movement counts—breaking up prolonged sitting improves metabolic and vascular health.",
        ],
        "sections": [
            {
                "heading": "Aerobic vs. Strength Training",
                "body": "Brisk walking, cycling, and swimming strengthen the heart and lungs, while resistance bands, bodyweight exercises, and weights preserve bone density and muscle mass.",
            },
            {
                "heading": "Starting Safely",
                "body": "Increase intensity and duration gradually, warm up before workouts, and stay hydrated.",
            },
        ],
        "when_to_seek_care": "Stop exercising and seek immediate medical care if you feel chest pain, severe shortness of breath, dizziness, or fainting during physical activity.",
        "sources": [
            {
                "name": "WHO — Physical Activity Fact Sheet",
                "organization": "World Health Organization (WHO)",
                "url": "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
            },
            {
                "name": "CDC — Physical Activity Basics for Adults",
                "organization": "CDC",
                "url": "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
            },
        ],
    },
    {
        "id": "mobility-and-injury-prevention",
        "title": "Mobility, Balance, and Safe Exercise Progression",
        "category": "Fitness and Exercise",
        "reading_time": "4 min read",
        "summary": "Practical steps to build flexibility, prevent overuse injuries, and incorporate balance training into weekly routines.",
        "key_points": [
            "Older adults benefit from multicomponent physical activity emphasizing functional balance and strength 3+ days per week.",
            "Rest and recovery days help muscles and tendons adapt safely.",
            "Proper footwear and gradual progression reduce joint strain.",
        ],
        "sections": [
            {
                "heading": "Warm-Up and Cool-Down",
                "body": "Spend 5 to 10 minutes with gentle dynamic movement before vigorous exercise, followed by light stretching afterward.",
            },
            {
                "heading": "Listening to Pain Signals",
                "body": "Mild muscle soreness is common after new workouts, whereas sharp joint pain, swelling, or instability warrants rest and medical review.",
            },
        ],
        "when_to_seek_care": "Consult a clinician or physical therapist for joint swelling, inability to bear weight, or pain lasting more than a few days.",
        "sources": [
            {
                "name": "MedlinePlus — Exercise and Physical Fitness",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/exerciseandphysicalfitness.html",
            },
            {
                "name": "CDC — Older Adult Activity",
                "organization": "CDC",
                "url": "https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html",
            },
        ],
    },
    {
        "id": "preventive-screenings-and-vaccines",
        "title": "Routine Preventive Health Screenings and Immunizations",
        "category": "Preventive Healthcare",
        "reading_time": "6 min read",
        "summary": "Overview of annual checkups, blood pressure and diabetes screenings, cancer screenings, and routine adult vaccinations.",
        "key_points": [
            "Preventive care detects cardiovascular, metabolic, and oncologic risks early—often before symptoms appear.",
            "Screening schedules vary by age, biological sex, family history, and personal risk factors.",
            "Keeping immunizations up to date protects both individuals and vulnerable community members.",
        ],
        "sections": [
            {
                "heading": "Common Adult Screenings",
                "body": "Routine primary care visits often review blood pressure, cholesterol, blood glucose/A1C, dental/vision health, and age-appropriate colorectal, cervical, or breast cancer screenings.",
            },
            {
                "heading": "Adult Immunization Checklists",
                "body": "Seasonal influenza, COVID-19 boosters, Tdap, shingles, and pneumococcal vaccines may be recommended depending on age and medical conditions.",
            },
        ],
        "when_to_seek_care": "Schedule an annual preventive wellness visit with a primary care clinician to personalize your screening calendar.",
        "sources": [
            {
                "name": "MedlinePlus — Health Screening",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/healthscreening.html",
            },
            {
                "name": "CDC — Adult Immunization Schedule",
                "organization": "CDC",
                "url": "https://www.cdc.gov/vaccines/hcp/imz-schedules/adult-age.html",
            },
        ],
    },
    {
        "id": "infection-prevention-hygiene",
        "title": "Everyday Infection Prevention and Hand Hygiene",
        "category": "Preventive Healthcare",
        "reading_time": "3 min read",
        "summary": "Simple, proven habits—handwashing, respiratory etiquette, and food safety—that reduce common respiratory and gastrointestinal infections.",
        "key_points": [
            "Wash hands with soap and water for at least 20 seconds after coughing, using the restroom, and before meals.",
            "Alcohol-based hand sanitizer (at least 60% alcohol) is effective when soap and water are unavailable.",
            "Stay home and rest when experiencing fever or contagious respiratory symptoms.",
        ],
        "sections": [
            {
                "heading": "Clean Hands Save Lives",
                "body": "Hand hygiene interrupts transmission of common viruses and bacteria picked up from shared surfaces.",
            },
            {
                "heading": "Food and Water Safety",
                "body": "Separate raw and cooked foods, cook meats to safe temperatures, and refrigerate perishable items promptly.",
            },
        ],
        "when_to_seek_care": "Seek medical evaluation for persistent high fever, dehydration, severe diarrhea, or breathing difficulty.",
        "sources": [
            {
                "name": "CDC — About Handwashing",
                "organization": "CDC",
                "url": "https://www.cdc.gov/clean-hands/about/index.html",
            },
            {
                "name": "WHO — Infection Prevention and Control",
                "organization": "World Health Organization (WHO)",
                "url": "https://www.who.int/health-topics/infection-prevention-and-control",
            },
        ],
    },
    {
        "id": "understanding-hypertension-and-diabetes",
        "title": "Understanding High Blood Pressure and Type 2 Diabetes",
        "category": "Common Health Conditions",
        "reading_time": "6 min read",
        "summary": "Educational overview of two common chronic conditions, why regular monitoring matters, and how lifestyle and medical care work together.",
        "key_points": [
            "Hypertension often has no noticeable symptoms, earning its name as a 'silent' cardiovascular risk factor.",
            "Hemoglobin A1C reflects average blood glucose levels over roughly the past 2 to 3 months.",
            "Early detection and ongoing clinician partnership significantly reduce long-term complications.",
        ],
        "sections": [
            {
                "heading": "Blood Pressure Basics",
                "body": "Blood pressure readings have two numbers: systolic (pressure during heartbeat) and diastolic (pressure between beats). Consistent home logs help clinicians assess true averages.",
            },
            {
                "heading": "Blood Sugar Awareness",
                "body": "Common warning signs of elevated blood sugar include increased thirst, frequent urination, fatigue, and blurred vision—though many people have no early symptoms.",
            },
        ],
        "when_to_seek_care": "Seek emergency care for blood pressure >= 180/120 with chest pain, shortness of breath, vision changes, or neurological symptoms, or for signs of severe hypoglycemia/hyperglycemia.",
        "sources": [
            {
                "name": "WHO — Hypertension Fact Sheet",
                "organization": "World Health Organization (WHO)",
                "url": "https://www.who.int/news-room/fact-sheets/detail/hypertension",
            },
            {
                "name": "CDC — Diabetes Basics",
                "organization": "CDC",
                "url": "https://www.cdc.gov/diabetes/about/index.html",
            },
        ],
    },
    {
        "id": "respiratory-illnesses-cold-flu",
        "title": "Common Respiratory Illnesses: Cold, Flu, and COVID-19 Overview",
        "category": "Common Health Conditions",
        "reading_time": "5 min read",
        "summary": "Compare overlapping respiratory symptoms, supportive self-care education, and red-flag signs that require urgent medical care.",
        "key_points": [
            "Viral upper respiratory infections often share symptoms like sore throat, cough, fatigue, and congestion.",
            "Antibiotics treat bacterial infections, not viruses—only a clinician can determine whether antibiotics are appropriate.",
            "Rest, fluids, and monitoring fever and breathing comfort are core supportive measures.",
        ],
        "sections": [
            {
                "heading": "Why Symptoms Overlap",
                "body": "Testing is often the most reliable way to distinguish influenza, COVID-19, RSV, or strep throat when treatment decisions depend on the cause.",
            },
            {
                "heading": "Protecting High-Risk Household Members",
                "body": "Older adults, infants, pregnant people, and immunocompromised individuals face higher risks of complications and should contact a clinician early when ill.",
            },
        ],
        "when_to_seek_care": "Seek immediate emergency care for trouble breathing, persistent chest pain, bluish lips/face, confusion, or inability to keep fluids down.",
        "sources": [
            {
                "name": "CDC — Respiratory Illnesses",
                "organization": "CDC",
                "url": "https://www.cdc.gov/respiratory-viruses/about/index.html",
            },
            {
                "name": "MedlinePlus — Common Cold",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/commoncold.html",
            },
        ],
    },
    {
        "id": "stress-anxiety-mental-wellbeing",
        "title": "Managing Everyday Stress and Supporting Mental Wellness",
        "category": "Mental Wellness",
        "reading_time": "5 min read",
        "summary": "Understand how chronic stress affects body and mind, evidence-based coping strategies, and when to connect with mental health professionals.",
        "key_points": [
            "Chronic stress can manifest physically as headaches, muscle tension, digestive upset, and disrupted sleep.",
            "Regular movement, social connection, mindfulness breathing, and structured routines support emotional resilience.",
            "Mental health conditions are common and treatable—reaching out for support is a sign of strength.",
        ],
        "sections": [
            {
                "heading": "Mind-Body Connection",
                "body": "Stress hormones temporarily prepare the body for challenges, but prolonged activation without recovery can strain sleep, mood, and cardiovascular health.",
            },
            {
                "heading": "Evidence-Based Daily Habits",
                "body": "Try paced breathing, setting digital boundaries before bedtime, breaking large tasks into small steps, and staying connected with trusted friends or family.",
            },
        ],
        "when_to_seek_care": "If anxiety, sadness, or overwhelm lasts more than two weeks or interferes with daily life, reach out to a doctor or licensed counselor. In a crisis or if having thoughts of self-harm, call or text 988 (US/Canada) or contact local emergency services immediately.",
        "sources": [
            {
                "name": "WHO — Mental Health: Strengthening Our Response",
                "organization": "World Health Organization (WHO)",
                "url": "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response",
            },
            {
                "name": "MedlinePlus — Stress",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/stress.html",
            },
            {
                "name": "CDC — Mental Health",
                "organization": "CDC",
                "url": "https://www.cdc.gov/mental-health/about/index.html",
            },
        ],
    },
    {
        "id": "recognizing-depression-and-burnout",
        "title": "Recognizing Burnout, Low Mood, and When to Seek Support",
        "category": "Mental Wellness",
        "reading_time": "4 min read",
        "summary": "Learn the signs of persistent low mood and burnout, and how primary care and mental health teams collaborate on care.",
        "key_points": [
            "Persistent loss of interest, changes in sleep or appetite, and fatigue lasting over 2 weeks warrant professional evaluation.",
            "Medical factors such as thyroid imbalance, anemia, or vitamin deficiencies can sometimes contribute to fatigue and mood shifts.",
            "Confidential support lines and primary care clinics can help connect you with appropriate care.",
        ],
        "sections": [
            {
                "heading": "Differentiating Temporary Stress from Persistent Symptoms",
                "body": "Everyone experiences difficult days, but ongoing exhaustion, hopelessness, or withdrawal deserves attentive medical and psychological support.",
            },
            {
                "heading": "Preparing for a Conversation",
                "body": "Jot down how long symptoms have lasted, sleep patterns, and stressors before your appointment so your clinician gets a clear picture.",
            },
        ],
        "when_to_seek_care": "Seek immediate crisis help if you or someone you know has thoughts of self-harm or suicide—contact local emergency services or a national crisis helpline right away.",
        "sources": [
            {
                "name": "MedlinePlus — Depression",
                "organization": "MedlinePlus (NIH)",
                "url": "https://medlineplus.gov/depression.html",
            },
            {
                "name": "WHO — Depressive Disorder Fact Sheet",
                "organization": "World Health Organization (WHO)",
                "url": "https://www.who.int/news-room/fact-sheets/detail/depression",
            },
        ],
    },
]


def list_articles(category: Optional[str] = None, query: Optional[str] = None) -> List[Dict]:
    results = ARTICLES
    if category and category.lower() != "all":
        results = [a for a in results if a["category"].lower() == category.lower()]
    if query and query.strip():
        q = query.strip().lower()
        results = [
            a
            for a in results
            if q in a["title"].lower()
            or q in a["summary"].lower()
            or q in a["category"].lower()
            or any(q in kp.lower() for kp in a["key_points"])
        ]
    return results


def get_article_by_id(article_id: str) -> Optional[Dict]:
    return next((a for a in ARTICLES if a["id"] == article_id), None)
