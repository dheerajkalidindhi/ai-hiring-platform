from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def compute_ai_score(job_text: str, candidate_text: str) -> float:
    if not candidate_text.strip():
        return 0.0

    embeddings = model.encode([job_text, candidate_text])
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()

    # Keyword matching boost
    job_keywords = set(job_text.lower().split())
    candidate_words = set(candidate_text.lower().split())

    overlap = len(job_keywords & candidate_words)
    keyword_score = overlap / len(job_keywords) if job_keywords else 0

    # Weighted score
    final_score = (0.7 * similarity) + (0.3 * keyword_score)

    return round(final_score * 100, 2)