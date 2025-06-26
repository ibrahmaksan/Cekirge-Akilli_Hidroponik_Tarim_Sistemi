import cv2
import numpy as np
from rknnlite.api import RKNNLite
from time import time
import os
from datetime import datetime
import base64

class Coco:
    CLASSES = (
        "29",                                     
        "Apple Scab Leaf",                       
        "Apple leaf",                             
        "Apple rust leaf",                        
        "Bell_pepper leaf spot",                  
        "Bell_pepper leaf",                       
        "Blueberry leaf",                         
        "Cherry leaf",                           
        "Corn Gray leaf spot",                    
        "Corn leaf blight",                       
        "Corn rust leaf",                         
        "Peach leaf",                             
        "Potato leaf late blight",               
        "Potato leaf late blight",                
        "Potato leaf late blight",                            
        "Raspberry leaf",                        
        "Soyabean leaf",                          
        "Squash Powdery mildew leaf",             
        "Strawberry leaf",                        
        "Tomato Early blight leaf",              
        "Tomato Septoria leaf spot",              
        "Tomato leaf bacterial spot",             
        "Tomato leaf late blight",                
        "Tomato leaf mosaic virus",               
        "Tomato leaf yellow virus",               
        "Tomato leaf",                            
        "Tomato mold leaf",                       
        "Tomato two spotted spider mites leaf",  
        "grape leaf black rot",                   
        "grape leaf"                              
    )

class SimpleYolov8_rknn:
    def __init__(self, model: str, classes=Coco.CLASSES, imgsz=(640,640), obj_threshold=0.5, nms_threshold=0.65) -> None:
        self.model = self.__load_rknn(model)
        self.frame = None
        self.w = imgsz[0]
        self.h = imgsz[1]
        self.obj_threshold = obj_threshold
        self.nms_threshold = nms_threshold

    def __load_rknn(self, link_model: str):
        print("?? RKNNLite yUkleniyor...")
        rknn_model = RKNNLite()
        ret = rknn_model.load_rknn(link_model)
        
        print("?? NPU runtime baSlat�l�yor...")
        ret = rknn_model.init_runtime(core_mask=RKNNLite.NPU_CORE_0_1_2)
        
        if ret != 0:
            print('? NPU runtime ba�lat�lamad�!')
            exit(ret)
            
        print("? Model ba�ar�yla y�klendi!")
        return rknn_model

    def filter_boxes(self, boxes, box_confidences, box_class_probs):
        box_confidences = box_confidences.reshape(-1)
        candidate, class_num = box_class_probs.shape
        class_max_score = np.max(box_class_probs, axis=-1)
        classes = np.argmax(box_class_probs, axis=-1)
        _class_pos = np.where(class_max_score * box_confidences >= self.obj_threshold)
        scores = (class_max_score * box_confidences)[_class_pos]
        boxes = boxes[_class_pos]
        classes = classes[_class_pos]
        return boxes, classes, scores

    def nms_boxes(self, boxes, scores):
        x = boxes[:, 0]
        y = boxes[:, 1]
        w = boxes[:, 2] - boxes[:, 0]
        h = boxes[:, 3] - boxes[:, 1]
        areas = w * h
        order = scores.argsort()[::-1]
        keep = []
        while order.size > 0:
            i = order[0]
            keep.append(i)
            xx1 = np.maximum(x[i], x[order[1:]])
            yy1 = np.maximum(y[i], y[order[1:]])
            xx2 = np.minimum(x[i] + w[i], x[order[1:]] + w[order[1:]])
            yy2 = np.minimum(y[i] + h[i], y[order[1:]] + h[order[1:]])
            w1 = np.maximum(0.0, xx2 - xx1 + 0.00001)
            h1 = np.maximum(0.0, yy2 - yy1 + 0.00001)
            inter = w1 * h1
            ovr = inter / (areas[i] + areas[order[1:]] - inter)
            inds = np.where(ovr <= self.nms_threshold)[0]
            order = order[inds + 1]
        return np.array(keep)

    def dfl(self, position):
        x = np.array(position)
        n, c, h, w = x.shape
        p_num = 4
        mc = c // p_num
        y = x.reshape(n, p_num, mc, h, w)
        max_values = np.max(y, axis=2, keepdims=True)
        exp_values = np.exp(y - max_values)
        y = exp_values / np.sum(exp_values, axis=2, keepdims=True)
        acc_matrix = np.arange(mc, dtype=np.float32).reshape(1, 1, mc, 1, 1)
        return np.sum(y * acc_matrix, axis=2)

    def box_process(self, position):
        grid_h, grid_w = position.shape[2:4]
        col, row = np.meshgrid(np.arange(0, grid_w), np.arange(0, grid_h))
        col = col.reshape(1, 1, grid_h, grid_w)
        row = row.reshape(1, 1, grid_h, grid_w)
        grid = np.concatenate((col, row), axis=1)
        stride = np.array([self.h // grid_h, self.w // grid_w]).reshape(1, 2, 1, 1)
        position = self.dfl(position)
        box_xy = grid + 0.5 - position[:, 0:2, :, :]
        box_xy2 = grid + 0.5 + position[:, 2:4, :, :]
        return np.concatenate((box_xy * stride, box_xy2 * stride), axis=1)

    def post_process(self, input_data):
        boxes, scores, classes_conf = [], [], []
        default_branch = 3
        pair_per_branch = len(input_data) // default_branch
        for i in range(default_branch):
            boxes.append(self.box_process(input_data[pair_per_branch * i]))
            classes_conf.append(input_data[pair_per_branch * i + 1])
            scores.append(np.ones_like(input_data[pair_per_branch * i + 1][:, :1, :, :], dtype=np.float32))

        def sp_flatten(_in):
            ch = _in.shape[1]
            _in = _in.transpose(0, 2, 3, 1)
            return _in.reshape(-1, ch)

        boxes = [sp_flatten(_v) for _v in boxes]
        classes_conf = [sp_flatten(_v) for _v in classes_conf]
        scores = [sp_flatten(_v) for _v in scores]

        boxes = np.concatenate(boxes)
        classes_conf = np.concatenate(classes_conf)
        scores = np.concatenate(scores)

        boxes, classes, scores = self.filter_boxes(boxes, scores, classes_conf)

        nboxes, nclasses, nscores = [], [], []
        for c in set(classes):
            inds = np.where(classes == c)
            b = boxes[inds]
            c = classes[inds]
            s = scores[inds]
            keep = self.nms_boxes(b, s)
            if len(keep) != 0:
                nboxes.append(b[keep])
                nclasses.append(c[keep])
                nscores.append(s[keep])

        if not nclasses and not nscores:
            return None, None, None

        return np.concatenate(nboxes), np.concatenate(nclasses), np.concatenate(nscores)

    def detect_and_draw(self, img: np.ndarray):
        """Detection yap ve sonu�lar� �iz"""
        print("?? Detection yap�l�yor...")
        start_time = time()
        
        outputs = self.model.inference(inputs=[img])
        boxes, classes, scores = self.post_process(outputs)
        
        inference_time = time() - start_time
        print(f"?? Inference s�resi: {inference_time*1000:.1f}ms")
        
        detection_results = []
        
        if boxes is not None:
            # Final threshold kontrol�
            high_conf_indices = scores >= self.obj_threshold
            
            if np.any(high_conf_indices):
                boxes = boxes[high_conf_indices]
                classes = classes[high_conf_indices]
                scores = scores[high_conf_indices]
                
                print(f"?? {len(boxes)} adet nesne tespit edildi!")
                
                # Bounding box'lar� �iz ve sonu�lar� kaydet
                for i, (box, cls, score) in enumerate(zip(boxes, classes, scores)):
                    box = box.astype(int)
                    
                    # S�n�f ad�n� al
                    if int(cls) < len(Coco.CLASSES):
                        class_name = Coco.CLASSES[int(cls)]
                    else:
                        class_name = f"Unknown_Class_{int(cls)}"
                    
                    # Sonucu kaydet
                    detection_results.append({
                        'class': class_name,
                        'confidence': float(score),
                        'bbox': [int(box[0]), int(box[1]), int(box[2]), int(box[3])]
                    })
                    
                    # Box'� �iz - kal�n ye�il �er�eve
                    cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 3)
                    
                    # Label metni
                    text = f"{class_name}: {score:.2f}"
                    
                    # Font ayarlar�
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    font_scale = 0.7
                    thickness = 2
                    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
                    
                    # Yaz�n�n konumunu ayarla
                    text_x = max(box[0], 5)
                    text_y = max(box[1] - 10, text_height + 10)
                    
                    # Yaz� arka plan� - koyu ye�il
                    cv2.rectangle(img, 
                                (text_x - 5, text_y - text_height - 5),
                                (text_x + text_width + 5, text_y + baseline + 5),
                                (0, 150, 0), -1)
                    
                    # Yaz�y� beyaz renkte yaz
                    cv2.putText(img, text, (text_x, text_y), font, font_scale, (255, 255, 255), thickness)
                    
                    print(f"  ?? {i+1}. {class_name} - G�ven: {score:.2f} - Konum: [{box[0]}, {box[1]}, {box[2]}, {box[3]}]")
            else:
                print("? Belirlenen e�ik de�erinin �zerinde nesne bulunamad�!")
        else:
            print("? Hi�bir nesne tespit edilmedi!")
        
        return img, detection_results, inference_time

    def release(self):
        self.model.release()

def capture_single_image(camera_index=0, width=640, height=480):
    """Tek bir g�rsel yakala"""
    print(f"?? Kamera {camera_index} a��l�yor...")
    
    # Kameray� a�
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        print(f"? Kamera {camera_index} a��lamad�!")
        return None
    
    # Kamera ayarlar�
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    print("?? G�rsel yakalan�yor...")
    
    # Birka� frame atla (kamera stabilizasyonu i�in)
    for _ in range(5):
        ret, frame = cap.read()
    
    # Son frame'i al
    ret, frame = cap.read()
    
    # Kameray� kapat
    cap.release()
    
    if ret and frame is not None:
        print("? G�rsel ba�ar�yla yakaland�!")
        return frame
    else:
        print("? G�rsel yakalanamad�!")
        return None

def save_results(detected_image):
    """Sadece detection sonucunu kaydet"""
    # Detection yap�lm�� g�r�nt�y� kaydet
    detected_filename = "bitki_goruntusu.jpg"
    cv2.imwrite(detected_filename, detected_image)
    print(f"?? Detection sonucu kaydedildi: {detected_filename}")
    
    return detected_filename

def capture_and_detect():
    """G�rsel yakala, detection yap ve base64 string d�nd�r"""
    try:
        print("?? G�rsel yakalan�yor ve detection yap�l�yor...")
        
        # Model y�kleme
        model = SimpleYolov8_rknn(model='leaf6.rknn', obj_threshold=0.5, nms_threshold=0.65)
        
        # G�rsel yakalama
        image = capture_single_image(camera_index=0, width=320, height=320)
        
        if image is None:
            print("? G�rsel yakalanamad�!")
            model.release()
            return None
        
        # G�r�nt�y� model boyutuna getir
        resized_image = cv2.resize(image, (640, 640))
        
        # Detection yap
        detected_image, results, inference_time = model.detect_and_draw(resized_image)
        
        # Sonu�lar� orijinal boyuta geri getir
        detected_image_original_size = cv2.resize(detected_image, (image.shape[1], image.shape[0]))
        
        # G�r�nt�y� base64'e �evir
        _, buffer = cv2.imencode('.jpg', detected_image_original_size)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Local olarak da kaydet
        cv2.imwrite("bitki_goruntusu.jpg", detected_image_original_size)
        
        print(f"? Detection tamamland�: {len(results)} nesne tespit edildi")
        
        # Model'i temizle
        model.release()
        
        return image_base64
        
    except Exception as e:
        print(f"? Detection hatas�: {e}")
        try:
            model.release()
        except:
            pass
        return None