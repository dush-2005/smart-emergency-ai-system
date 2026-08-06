import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
data = pd.read_csv('data/accident_data.csv')

X = data[['acc','gyro','speed_drop','no_motion']]
y = data['label']

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model
joblib.dump(model, 'model.pkl')

print('AI model trained and saved as model.pkl')