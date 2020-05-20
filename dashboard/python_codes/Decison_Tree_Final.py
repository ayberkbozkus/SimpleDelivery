#!/usr/bin/env python
# coding: utf-8

# ### FROM URL

# In[145]:


import requests
import pandas as pd
import numpy as np
# Load libraries
from sklearn.tree import DecisionTreeClassifier # Import Decision Tree Classifier
from sklearn.model_selection import train_test_split # Import train_test_split function
from sklearn import metrics #Import scikit-learn metrics module for accuracy calculation
from sklearn import preprocessing
from sklearn import utils
import matplotlib.pyplot as plt
import sklearn
from sklearn import tree


# In[146]:


url = "http://160.75.154.58:5000/realdata2"
r = requests.get(url)
data=r.json()
data


# ### FROM CSV

# In[536]:


import pandas as pd
df = pd.read_csv('https://raw.githubusercontent.com/leventguner/kortsis/master/df_4may_2307.csv?token=ANPQE2PV3HTYNB5I6FPU3OC6XGZWC')
# get data with github raw
print(df.dtypes)
df['UserId'].nunique()
df.set_index('UserId',inplace=True)
df.head()
df2=df.groupby(df.index).apply(lambda x: x.tail(40))## son 50 satır
df3=df2.groupby('UserId').mean()


# In[537]:


np.random.seed(1)
size=df3.last_valid_index()+1
df3['Gender'] = pd.DataFrame({"Gender"  : np.random.randint(0, 2, size=size)})
Genders = {0:'Female', 1:'Male'}
for elem in df3['Gender'].unique():
    df3[Genders[elem]] = df3['Gender'] == elem

df3['Male'] = pd.Categorical(df3.Male)
df3['Female'] = pd.Categorical(df3.Male)
print (df3.dtypes)


# In[538]:


df3['Age'] = pd.DataFrame({"Age"  : np.random.randint(5, 75, size=size)})
df3.loc[df3['Temperature']>36.5]


# In[539]:


df3['Rate'] = 0
### Temps
df3.loc[(df3['Temperature']>38 ) , 'Rate'] = 1.0
df3.loc[(df3['Temperature']>37.5) & (df3['Temperature']<38), 'Rate'] = 0.8
df3.loc[(df3['Temperature']>37) & (df3['Temperature']<37.5), 'Rate'] = 0.6
df3.loc[(df3['Temperature']>36.5) & (df3['Temperature']<37), 'Rate'] = 0.4
df3.loc[(df3['Temperature']>36) & (df3['Temperature']<36.5), 'Rate'] = 0.2

### Ages
df3.loc[(df3['Age']>=65),'Rate']+=0.4
df3.loc[(df3['Age']<15,'Rate')]+=0.2
df3.loc[(df3['Age']<65)&(df3['Age']>=50),'Rate']+=0.2

## Gender
df3.loc[(df3['Male']==True),'Rate']*=1.2
x=df3['Rate'].value_counts().sort_index(ascending=False)
print(x)

df3['Risk']=0
df3.loc[(df3['Rate']>=1.00 ) , 'Risk'] = 5
df3.loc[(df3['Rate']>=0.70 )& (df3['Rate']<1.00) , 'Risk'] = 4
df3.loc[(df3['Rate']>=0.50 )& (df3['Rate']<0.70) , 'Risk'] = 3
df3.loc[(df3['Rate']>=0.20 )& (df3['Rate']<0.50) , 'Risk'] = 2
df3.loc[(df3['Rate']<0.20) , 'Risk'] = 1
df3.head()


# ### Decision Tree Classifier

# In[540]:


#Feature Selection
feature_cols=['Temperature','Male','Female','Age']
X=df3[feature_cols].values
y=df3.Risk.values
# Split dataset into training set and test set
X_train, X_test, y_train, y_test = train_test_split(X, y,random_state = 0) # 70% training and 30% test
clf = DecisionTreeClassifier()
clf = clf.fit(X,y)
#y_pred = clf.predict(X_test)

## Plot Figure
y_names=['1','2','3','4','5']
plt.figure(figsize=(20,15))
sklearn.tree.plot_tree(clf,feature_names=df3[feature_cols].columns.to_list(),class_names=y_names,filled=True, 
              rounded=True,fontsize=14);
plt.savefig('Corona_Decision_Tree_May.png')

