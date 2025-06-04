import sys
import PyPDF2
from transformers import pipeline

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def generate_questions(text, num_questions=5):
    # Use a pre-trained model for question generation
    qg = pipeline("text2text-generation", model="valhalla/t5-base-qg-hl")
    # For demo: just take the first 500 words
    context = " ".join(text.split()[:500])
    questions = []
    for i in range(num_questions):
        result = qg(f"generate question: {context}")
        questions.append(result[0]['generated_text'])
    return questions

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_assignment.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    questions = generate_questions(text)
    print("Generated Assignment Questions:")
    for i, q in enumerate(questions, 1):
        print(f"{i}. {q}")