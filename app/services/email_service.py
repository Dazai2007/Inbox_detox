import re
import time
from typing import Tuple
from openai import OpenAI
from app.core.config import settings
from app.models.models import EmailCategory
from app.schemas.schemas import EmailAnalysis

class EmailAnalysisService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
    
    def analyze_email(self, content: str, subject: str = None) -> EmailAnalysis:
        """Analyze email content and return summary with category."""
        start_time = time.time()
        
        try:
            # Prepare the prompt
            email_text = f"Subject: {subject}\n\n{content}" if subject else content
            
            prompt = f"""
            Analyze this email and provide:
            1. A concise summary (max 2 sentences)
            2. A category from: important, invoice, meeting, spam, newsletter, social, promotion, other
            3. A confidence score (0-100) for the categorization
            
            Email:
            {email_text}
            
            Respond in this exact format:
            SUMMARY: [your summary here]
            CATEGORY: [category]
            CONFIDENCE: [score]
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert email analyzer. Be concise and accurate."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.3
            )
            
            # Parse the response
            analysis_text = response.choices[0].message.content
            summary, category, confidence = self._parse_analysis(analysis_text)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return EmailAnalysis(
                summary=summary,
                category=category,
                confidence_score=min(confidence, 100)  # Cap at 100
            )
            
        except Exception as e:
            # Fallback analysis
            return self._fallback_analysis(content, subject)
    
    def _parse_analysis(self, analysis_text: str) -> Tuple[str, EmailCategory, int]:
        """Parse the OpenAI response."""
        try:
            # Extract summary
            summary_match = re.search(r'SUMMARY:\s*(.+?)(?=\nCATEGORY:|$)', analysis_text, re.DOTALL)
            summary = summary_match.group(1).strip() if summary_match else "Unable to generate summary"
            
            # Extract category
            category_match = re.search(r'CATEGORY:\s*(\w+)', analysis_text)
            category_str = category_match.group(1).lower() if category_match else "other"
            
            # Map to EmailCategory enum
            category_mapping = {
                'important': EmailCategory.IMPORTANT,
                'invoice': EmailCategory.INVOICE,
                'meeting': EmailCategory.MEETING,
                'spam': EmailCategory.SPAM,
                'newsletter': EmailCategory.NEWSLETTER,
                'social': EmailCategory.SOCIAL,
                'promotion': EmailCategory.PROMOTION,
                'other': EmailCategory.OTHER
            }
            category = category_mapping.get(category_str, EmailCategory.OTHER)
            
            # Extract confidence
            confidence_match = re.search(r'CONFIDENCE:\s*(\d+)', analysis_text)
            confidence = int(confidence_match.group(1)) if confidence_match else 70
            
            return summary, category, confidence
            
        except Exception:
            return "Analysis parsing failed", EmailCategory.OTHER, 50
    
    def _fallback_analysis(self, content: str, subject: str = None) -> EmailAnalysis:
        """Provide basic analysis when AI fails."""
        # Simple keyword-based categorization as fallback
        content_lower = content.lower()
        subject_lower = (subject or "").lower()
        full_text = f"{subject_lower} {content_lower}"
        
        # Basic category detection
        if any(word in full_text for word in ['urgent', 'asap', 'deadline', 'critical']):
            category = EmailCategory.IMPORTANT
        elif any(word in full_text for word in ['invoice', 'payment', 'bill', 'receipt']):
            category = EmailCategory.INVOICE
        elif any(word in full_text for word in ['meeting', 'calendar', 'schedule', 'appointment']):
            category = EmailCategory.MEETING
        elif any(word in full_text for word in ['unsubscribe', 'newsletter', 'marketing']):
            category = EmailCategory.NEWSLETTER
        elif any(word in full_text for word in ['spam', 'suspicious', 'phishing']):
            category = EmailCategory.SPAM
        else:
            category = EmailCategory.OTHER
        
        # Generate basic summary
        summary = f"Email {f'about {subject}' if subject else 'received'}"
        if len(content) > 100:
            summary += f": {content[:97]}..."
        
        return EmailAnalysis(
            summary=summary,
            category=category,
            confidence_score=30  # Low confidence for fallback
        )