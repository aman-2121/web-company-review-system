import re

filepath = r'c:/Users/DBU/company/review/client/src/components/ReviewCard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: The space-x-2 div (rating+menu) is inside space-x-3 div (avatar+user)
# It should be a sibling. We need to close space-x-3 before space-x-2 starts.

old = '''          </div>

        <div className="flex items-center space-x-2">
          <AverageRating rating={review.rating} size="sm" />'''

new = '''          </div>
        </div>

        <div className="flex items-center space-x-2">
          <AverageRating rating={review.rating} size="sm" />'''

content = content.replace(old, new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed header structure!')

