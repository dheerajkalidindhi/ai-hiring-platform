import re
from PyPDF2 import PdfReader


# -------------------------
# Known Skill Dictionary
# -------------------------
KNOWN_SKILLS = [
    "python", "sql", "java", "fastapi", "django",
    "tableau", "powerbi", "excel",
    "machine learning", "deep learning",
    "aws", "azure", "docker",
    "react", "node", "javascript",
    "pandas", "numpy", "tensorflow", "pytorch"
]


# -------------------------
# Extract text from PDF
# -------------------------
def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text.lower()


# -------------------------
# Extract skills from text
# -------------------------
def extract_skills_from_text(text: str):
    text = text.lower()
    found_skills = []

    for skill in KNOWN_SKILLS:
        if skill in text:
            found_skills.append(skill)

    return found_skills


# -------------------------
# Extract years of experience
# -------------------------
def extract_years_of_experience(text: str) -> int:
    text = text.lower()

    # Match patterns like:
    # "3 years"
    # "5+ years"
    # "2 yrs"
    matches = re.findall(r'(\d+)\s*\+?\s*(years|year|yrs|yr)', text)

    if matches:
        # Return highest number found
        years = [int(match[0]) for match in matches]
        return max(years)

    return 0