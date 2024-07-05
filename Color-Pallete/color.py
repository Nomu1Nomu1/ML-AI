from PIL import Image
from matplotlib import pyplot as plt
import numpy as np

def get_image_palette(image, num_colors=10):
    image = image.resize((100, 100))
    
    data = np.array(image)
    data = data.reshape((-1, 3))
    
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=num_colors)
    kmeans.fit(data)
    
    palette = kmeans.cluster_centers_
    palette = palette.round(0).astype(int).tolist() 
    return palette

img_path_new = "Color-Pallete/Kobo-Kanaeru_pr-img_01.png"
img_new = Image.open(img_path_new)


img_new = img_new.convert('RGB')

palette_new = get_image_palette(img_new)

plt.figure(figsize=(8, 2))
plt.imshow([palette_new], aspect='auto')
plt.axis('off')
plt.show()

palette_new
