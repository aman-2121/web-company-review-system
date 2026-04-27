import re

filepath = r'c:/Users/DBU/company/review/client/src/components/ReviewCard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add missing </div> to close the header flex container
# After the menu dropdown div closes, we need to close the outer flex container
old1 = '''          )}
        </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">'''
new1 = '''          )}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">'''
content = content.replace(old1, new1)

# Fix 2: Close the editing reply div properly
old2 = '''                  </div>
              ) : ('''
new2 = '''                  </div>
                </div>
              ) : ('''
content = content.replace(old2, new2)

# Fix 3: Close the reply form div
old3 = '''          </div>
      )}

      {/* Report Modal */}'''
new3 = '''          </div>
        </div>
      )}

      {/* Report Modal */}'''
content = content.replace(old3, new3)

# Fix 4: Close the report modal divs properly
old4 = '''            </div>
        </div>
      )}
    </div>
  );
};'''
new4 = '''            </div>
          </div>
        </div>
      )}
    </div>
  );
};'''
content = content.replace(old4, new4)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all structural issues!')

