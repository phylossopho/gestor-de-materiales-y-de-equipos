// --- Datos de la aplicación ---
const app = {
    // Variables globales
    currentEquipment: 'Espada',
    currentClass: 'Normal',
    currentLevel: '1',
    currentColor: 'blanco',
    colorPorMaterialSeleccionado: {},
    materialStorage: {},
    cambiosPendientes: false,
    colorNoSeleccionado: '#808080',
    galleryImages: [],
    currentCarouselIndex: 0,
    
    // Mapa de colores
    colorMap: {
        'blanco': 'white',
        'verde': '#90EE90',
        'azul': '#ADD8E6',
        'morado': '#DDA0DD',
        'dorado': '#FFD700'
    },
    
    // Datos de materiales
    materialsData: {
        "Lord y Noble Lord": {
            "common": [
                "Voluntad del emperador", "Guardia del emperador", "Alma del emperador", "Aliento del emperador"
            ]
        },
        "Campeón y Planewalker": {
            "Espada": ["Quijada ácida", "Oro talon", "Hoja de jade", "Ámbar hierba"],
            "Pecho":  ["Quijada ácida", "Oro talon", "Hoja de jade", "Ámbar hierba"],
            "Botas":  ["Carbonizado gnarl", "Acero reforzado", "Pluma Stick", "Extracto destilado"],
            "Casco":  ["Carbonizado gnarl", "Acero reforzado", "Pluma Stick", "Extracto destilado"],
            "Guantes":["Razor diente de sierra", "Piel de terciopelo", "Crystal mystic", "Tempest Stardust"],
            "Cinturón":["Razor diente de sierra", "Piel de terciopelo", "Crystal mystic", "Tempest Stardust"]
        },
        "Normal": {
            "Espada": ["Maxilar", "Garra", "Hoja", "Césped"],
            "Pecho":  ["Maxilar", "Garra", "Hoja", "Césped"],
            "Botas":  ["Nudo", "Acero", "Pluma", "Extraer"],
            "Casco":  ["Nudo", "Acero", "Pluma", "Extraer"],
            "Guantes":["Diente de sierra", "Pelaje", "Cristal", "Stardust"],
            "Cinturón":["Diente de sierra", "Pelaje", "Cristal", "Stardust"]
        }
    },
    
    // Inicializar la aplicación
    init() {
        this.buildMaterialToEquipmentMap();
        this.initializeMaterialStorage();
        this.loadSavedGalleryImages();
        this.setupEventListeners();
        this.updateUI();
    },
    
    // Construir mapa de materiales a equipo
    buildMaterialToEquipmentMap() {
        this.materialToEquipmentMap = {};
        
        for (const [clase, equiposData] of Object.entries(this.materialsData)) {
            if (clase === "Lord y Noble Lord") {
                for (const mat of equiposData.common) {
                    this.materialToEquipmentMap[`${clase}:${mat}`] = "common";
                }
            } else {
                for (const [equipo, materials] of Object.entries(equiposData)) {
                    for (const mat of materials) {
                        const key = `${clase}:${mat}`;
                        if (!this.materialToEquipmentMap[key]) {
                            this.materialToEquipmentMap[key] = equipo;
                        }
                    }
                }
            }
        }
    },
    
    // Inicializar almacenamiento de materiales
    initializeMaterialStorage() {
        for (const clase in this.materialsData) {
            const equiposIterar = clase === "Lord y Noble Lord" ? ["common"] : Object.keys(this.materialsData[clase]);
            
            for (const equipo of equiposIterar) {
                for (const mat of this.materialsData[clase][equipo]) {
                    const storageKey = `${clase}:${mat}`;
                    
                    if (!this.materialStorage[storageKey]) {
                        this.materialStorage[storageKey] = {
                            'dorado': '0',
                            'morado': '0',
                            'azul': '0',
                            'verde': '0',
                            'blanco': '0'
                        };
                    }
                }
            }
        }
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Selectores principales
        document.getElementById('equipment-select').addEventListener('change', (e) => {
            this.currentEquipment = e.target.value;
            this.updateUI();
        });
        
        document.getElementById('level-select').addEventListener('change', (e) => {
            this.currentLevel = e.target.value;
            this.updateUI();
        });
        
        document.getElementById('class-select').addEventListener('change', (e) => {
            this.currentClass = e.target.value;
            this.updateUI();
        });
        
        document.getElementById('color-select').addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            this.updateUI();
        });
        
        // Botones
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
        document.getElementById('import-csv').addEventListener('click', () => {
            document.getElementById('csv-file').click();
        });
        
        // Event listeners para botones móviles
        document.getElementById('mobile-export-csv').addEventListener('click', () => {
            this.exportCSV();
            this.hideMobileCSVMenu();
        });
        
        document.getElementById('mobile-import-csv').addEventListener('click', () => {
            document.getElementById('csv-file').click();
            this.hideMobileCSVMenu();
        });
        
        // Toggle del menú CSV móvil
        document.getElementById('csv-menu-toggle').addEventListener('click', () => {
            this.toggleMobileCSVMenu();
        });
        
        document.getElementById('csv-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importCSV(e.target.files[0]);
            }
        });
        
        document.getElementById('show-materials').addEventListener('click', () => {
            this.openMaterialList();
        });
        
        document.getElementById('use-materials').addEventListener('click', () => {
            this.useMaterials();
        });
        
        // Galería de imágenes
        document.getElementById('gallery-button').addEventListener('click', () => {
            this.openGallery();
        });
        
        document.getElementById('add-image-button').addEventListener('click', () => {
            document.getElementById('gallery-file-input').click();
        });
        
        document.getElementById('gallery-file-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.addImageToGallery(e.target.files[0]);
            }
        });
        
        // Carrusel de imágenes
        document.getElementById('carousel-close').addEventListener('click', () => {
            document.getElementById('carousel-modal').style.display = 'none';
        });
        
        document.getElementById('carousel-prev').addEventListener('click', () => {
            this.showPrevCarouselImage();
        });
        
        document.getElementById('carousel-next').addEventListener('click', () => {
            this.showNextCarouselImage();
        });
        
        // Listeners para pestañas
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Desactivar todas las pestañas
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Activar la pestaña seleccionada
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
                
                // Si es una pestaña de conversión (excepto leyenda), actualizar su tabla
                if (tabId !== 'materials' && tabId !== 'conversionlegend') {
                    this.updateConversionTable(tabId);
                }
            });
        });
        
        // Cerrar modales
        const closeButtons = document.querySelectorAll('.close, #message-ok');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('materials-modal').style.display = 'none';
                document.getElementById('message-modal').style.display = 'none';
                document.getElementById('gallery-modal').style.display = 'none';
            });
        });
        
        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('materials-modal')) {
                document.getElementById('materials-modal').style.display = 'none';
            }
            if (e.target === document.getElementById('message-modal')) {
                document.getElementById('message-modal').style.display = 'none';
            }
            if (e.target === document.getElementById('gallery-modal')) {
                document.getElementById('gallery-modal').style.display = 'none';
            }
            if (e.target === document.getElementById('carousel-modal')) {
                document.getElementById('carousel-modal').style.display = 'none';
            }
        });
        
        // Teclas para el carrusel
        window.addEventListener('keydown', (e) => {
            if (document.getElementById('carousel-modal').style.display === 'block') {
                if (e.key === 'ArrowLeft') {
                    this.showPrevCarouselImage();
                } else if (e.key === 'ArrowRight') {
                    this.showNextCarouselImage();
                } else if (e.key === 'Escape') {
                    document.getElementById('carousel-modal').style.display = 'none';
                }
            }
        });
    },
    
    // Actualizar UI completa
    updateUI() {
        this.updateEquipmentImage();
        this.updateTable();
        this.updateBottomMaterialSelectors();
        
        // Actualizar las tablas de conversión activas
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab && activeTab.getAttribute('data-tab') !== 'materials' && activeTab.getAttribute('data-tab') !== 'conversionlegend') {
            this.updateConversionTable(activeTab.getAttribute('data-tab'));
        }
    },
    
    // Abrir galería de imágenes
    openGallery() {
        const modal = document.getElementById('gallery-modal');
        const galleryContainer = document.getElementById('gallery-container');
        galleryContainer.innerHTML = '';
        
        // Cargar imágenes existentes
        this.loadGalleryImages();
        
        // Mostrar galería
        modal.style.display = 'block';
    },
    
    // Cargar imágenes de la galería
    loadGalleryImages() {
        const galleryContainer = document.getElementById('gallery-container');
        
        // Limpiar el contenedor
        galleryContainer.innerHTML = '';
        
        // Cargar imágenes desde el array de galleryImages
        this.galleryImages.forEach((img, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${img}" alt="Imagen de la galería">
                <div class="gallery-item-controls">
                    <button class="delete-image-button" data-index="${index}">×</button>
                </div>
            `;
            
            // Agregar event listener al botón de eliminar
            galleryItem.querySelector('.delete-image-button').addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.removeImageFromGallery(index);
                e.stopPropagation(); // Evitar que el evento se propague
            });
            
            // Agregar event listener para abrir el carrusel
            galleryItem.addEventListener('click', () => {
                this.openImageCarousel(index);
            });
            
            galleryContainer.appendChild(galleryItem);
        });
    },
    
    // Abrir carrusel de imágenes
    openImageCarousel(index) {
        if (this.galleryImages.length === 0) return;
        
        const carouselModal = document.getElementById('carousel-modal');
        const carouselImage = document.getElementById('carousel-image');
        const carouselCounter = document.getElementById('carousel-counter');
        
        this.currentCarouselIndex = index;
        
        // Establecer imagen actual
        carouselImage.src = this.galleryImages[index];
        
        // Actualizar contador
        carouselCounter.textContent = `${index + 1} / ${this.galleryImages.length}`;
        
        // Mostrar/ocultar botones de navegación
        document.getElementById('carousel-prev').style.display = this.galleryImages.length > 1 ? 'block' : 'none';
        document.getElementById('carousel-next').style.display = this.galleryImages.length > 1 ? 'block' : 'none';
        
        // Mostrar carrusel
        carouselModal.style.display = 'block';
    },
    
    // Mostrar imagen anterior en el carrusel
    showPrevCarouselImage() {
        if (this.galleryImages.length <= 1) return;
        
        this.currentCarouselIndex = (this.currentCarouselIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        const carouselImage = document.getElementById('carousel-image');
        const carouselCounter = document.getElementById('carousel-counter');
        
        carouselImage.src = this.galleryImages[this.currentCarouselIndex];
        carouselCounter.textContent = `${this.currentCarouselIndex + 1} / ${this.galleryImages.length}`;
    },
    
    // Mostrar imagen siguiente en el carrusel
    showNextCarouselImage() {
        if (this.galleryImages.length <= 1) return;
        
        this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.galleryImages.length;
        const carouselImage = document.getElementById('carousel-image');
        const carouselCounter = document.getElementById('carousel-counter');
        
        carouselImage.src = this.galleryImages[this.currentCarouselIndex];
        carouselCounter.textContent = `${this.currentCarouselIndex + 1} / ${this.galleryImages.length}`;
    },
    
    // Agregar imagen a la galería
    addImageToGallery(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Agregar la imagen al array
            this.galleryImages.push(e.target.result);
            
            // Guardar las imágenes en localStorage
            this.saveGalleryImages();
            
            // Recargar la galería
            this.loadGalleryImages();
        };
        
        reader.onerror = () => {
            this.showMessage("Error", "Error al cargar la imagen.");
        };
        
        reader.readAsDataURL(file);
    },
    
    // Eliminar imagen de la galería
    removeImageFromGallery(index) {
        // Eliminar la imagen del array
        this.galleryImages.splice(index, 1);
        
        // Guardar las imágenes en localStorage
        this.saveGalleryImages();
        
        // Recargar la galería
        this.loadGalleryImages();
    },
    
    // Guardar imágenes de la galería en localStorage
    saveGalleryImages() {
        try {
            localStorage.setItem('galleryImages', JSON.stringify(this.galleryImages));
        } catch (e) {
            console.error('Error al guardar las imágenes de la galería:', e);
        }
    },
    
    // Cargar imágenes de la galería desde localStorage
    loadSavedGalleryImages() {
        try {
            const savedImages = localStorage.getItem('galleryImages');
            if (savedImages) {
                this.galleryImages = JSON.parse(savedImages);
            }
        } catch (e) {
            console.error('Error al cargar las imágenes de la galería:', e);
        }
    },
    
    // Actualizar tabla de conversión
    updateConversionTable(conversionType) {
        const tableContainer = document.getElementById(`${conversionType}-table`);
        tableContainer.innerHTML = '';
        
        const table = document.createElement('table');
        
        // Encabezados de la tabla
        const headers = ["", "Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"];
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        table.appendChild(headerRow);
        
        // Obtener materiales según la selección actual
        let materials;
        if (this.currentClass === "Lord y Noble Lord") {
            materials = this.materialsData[this.currentClass]["common"];
        } else {
            materials = this.materialsData[this.currentClass][this.currentEquipment];
        }
        
        // Reordenar materiales: material 3, material 1, material 2, material 4
        if (materials && materials.length >= 4) {
            materials = [materials[2], materials[0], materials[1], materials[3]];
        }
        
        // Crear filas para cada material
        materials.forEach(mat => {
            const storageKey = `${this.currentClass}:${mat}`;
            const row = document.createElement('tr');
            
            // Celda de imagen
            const imgCell = document.createElement('td');
            const img = document.createElement('img');
            img.src = `images/${mat.toLowerCase()}.png`;
            img.onerror = () => { img.style.display = 'none'; };
            imgCell.appendChild(img);
            row.appendChild(imgCell);
            
            // Celda de nombre del material
            const nameCell = document.createElement('td');
            nameCell.textContent = mat;
            row.appendChild(nameCell);
            
            // Crear una copia del almacenamiento para esta conversión
            const convertedStorage = this.getConvertedStorage(storageKey, conversionType);
            
            // Celdas de colores
            ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
                const colorCell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'color-input';
                input.setAttribute('data-color', color);
                input.value = convertedStorage[color];
                input.readOnly = true; // Las celdas son de solo lectura en las conversiones
                colorCell.appendChild(input);
                row.appendChild(colorCell);
            });
            
            table.appendChild(row);
        });
        
        tableContainer.appendChild(table);
    },
    
    // Obtener almacenamiento convertido según el tipo de conversión
    getConvertedStorage(storageKey, conversionType) {
        // Crear una copia de los valores actuales
        const currentValues = {};
        for (const color in this.materialStorage[storageKey]) {
            currentValues[color] = parseInt(this.materialStorage[storageKey][color]) || 0;
        }
        
        // Aplicar la conversión adecuada
        switch (conversionType) {
            case 'conversion1':
                // Conversión 1: Blancos -> Verdes (4:1)
                return this.convertMaterials(currentValues, 'blanco', 'verde', 4);
                
            case 'conversion2':
                // Conversión 2: Verdes -> Azules (4:1)
                // Primero aplicamos conversión 1
                const step1 = this.convertMaterials(currentValues, 'blanco', 'verde', 4);
                // Luego aplicamos conversión 2
                return this.convertMaterials(step1, 'verde', 'azul', 4);
                
            case 'conversion3':
                // Conversión 3: Azules -> Morados (4:1)
                // Aplicamos conversiones 1, 2 y 3 en secuencia
                const step1b = this.convertMaterials(currentValues, 'blanco', 'verde', 4);
                const step2b = this.convertMaterials(step1b, 'verde', 'azul', 4);
                return this.convertMaterials(step2b, 'azul', 'morado', 4);
                
            case 'conversionfinal':
                // Conversión Final: Morados -> Dorados (4:1)
                // Aplicamos todas las conversiones en secuencia
                const step1c = this.convertMaterials(currentValues, 'blanco', 'verde', 4);
                const step2c = this.convertMaterials(step1c, 'verde', 'azul', 4);
                const step3c = this.convertMaterials(step2c, 'azul', 'morado', 4);
                return this.convertMaterials(step3c, 'morado', 'dorado', 4);
                
            default:
                return currentValues;
        }
    },
    
    // Función auxiliar para convertir materiales
    convertMaterials(values, fromColor, toColor, ratio) {
        // Crear una copia de los valores
        const result = { ...values };
        
        // Calcular cuántos materiales se pueden convertir
        const convertibleAmount = Math.floor(result[fromColor] / ratio);
        
        // Realizar la conversión
        if (convertibleAmount > 0) {
            result[fromColor] -= convertibleAmount * ratio;
            result[toColor] += convertibleAmount;
        }
        
        // Devolver objeto con valores convertidos
        return result;
    },
    
    // Actualizar imagen del equipo
    updateEquipmentImage() {
        const imgElement = document.getElementById('equipment-img');
        imgElement.src = `images/${this.currentEquipment.toLowerCase()}.png`;
    },
    
    // Actualizar tabla de materiales
    updateTable() {
        const tableContainer = document.getElementById('materials-table');
        tableContainer.innerHTML = '';
        
        const table = document.createElement('table');
        
        // Encabezados de la tabla
        const headers = ["", "Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"];
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        table.appendChild(headerRow);
        
        // Obtener materiales según la selección actual
        let materials;
        if (this.currentClass === "Lord y Noble Lord") {
            materials = this.materialsData[this.currentClass]["common"];
        } else {
            materials = this.materialsData[this.currentClass][this.currentEquipment];
        }
        
        // Reordenar materiales: material 3, material 1, material 2, material 4
        if (materials && materials.length >= 4) {
            materials = [materials[2], materials[0], materials[1], materials[3]];
        }
        
        // Crear filas para cada material
        materials.forEach(mat => {
            const storageKey = `${this.currentClass}:${mat}`;
            const row = document.createElement('tr');
            
            // Celda de imagen
            const imgCell = document.createElement('td');
            const img = document.createElement('img');
            img.src = `images/${mat.toLowerCase()}.png`;
            img.onerror = () => { img.style.display = 'none'; };
            imgCell.appendChild(img);
            row.appendChild(imgCell);
            
            // Celda de nombre del material
            const nameCell = document.createElement('td');
            nameCell.textContent = mat;
            row.appendChild(nameCell);
            
            // Celdas de colores
            ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
                const colorCell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'color-input';
                input.setAttribute('data-color', color);
                input.value = this.materialStorage[storageKey][color];
                input.addEventListener('input', (e) => {
                    if (/^\d*$/.test(e.target.value)) { // Solo permitir números
                        this.materialStorage[storageKey][color] = e.target.value;
                        this.cambiosPendientes = true;
                    } else {
                        e.target.value = this.materialStorage[storageKey][color]; // Restaurar valor anterior
                    }
                });
                colorCell.appendChild(input);
                row.appendChild(colorCell);
            });
            
            table.appendChild(row);
        });
        
        tableContainer.appendChild(table);
    },
    
    // Actualizar selectores de material en la parte inferior
    updateBottomMaterialSelectors() {
        const bottomSection = document.getElementById('bottom-section');
        bottomSection.innerHTML = '';
        
        let materials = this.currentClass === "Lord y Noble Lord" 
            ? this.materialsData[this.currentClass].common 
            : this.materialsData[this.currentClass][this.currentEquipment];
            
        // Reordenar materiales: material 3, material 1, material 2, material 4
        if (materials && materials.length >= 4) {
            materials = [materials[2], materials[0], materials[1], materials[3]];
        }
        
        materials.forEach(mat => {
            const storageKey = `${this.currentClass}:${mat}`;
            const currentColor = this.colorPorMaterialSeleccionado[storageKey];
            let bgColor = this.colorNoSeleccionado;
            
            // Verificar si el color seleccionado es obtenible
            if (currentColor) {
                const cantidadesActuales = {};
                for (const c in this.colorMap) {
                    cantidadesActuales[c] = parseInt(this.materialStorage[storageKey][c]) || 0;
                }
                
                const resultado = this.simularUso(cantidadesActuales, currentColor);
                if (resultado.exito) {
                    bgColor = this.colorMap[currentColor];
                } else {
                    delete this.colorPorMaterialSeleccionado[storageKey];
                    bgColor = this.colorNoSeleccionado;
                }
            }
            
            // Crear selector de material
            const materialSelector = document.createElement('div');
            materialSelector.className = 'material-selector';
            materialSelector.style.backgroundColor = bgColor;
            
            // Imagen del material
            const img = document.createElement('img');
            img.src = `images/${mat.toLowerCase()}.png`;
            img.onerror = () => { img.style.display = 'none'; };
            materialSelector.appendChild(img);
            
            // Selector de color
            const select = document.createElement('select');
            select.innerHTML = `
                <option value="">-</option>
                <option value="blanco" ${currentColor === 'blanco' ? 'selected' : ''}>Blanco</option>
                <option value="verde" ${currentColor === 'verde' ? 'selected' : ''}>Verde</option>
                <option value="azul" ${currentColor === 'azul' ? 'selected' : ''}>Azul</option>
                <option value="morado" ${currentColor === 'morado' ? 'selected' : ''}>Morado</option>
                <option value="dorado" ${currentColor === 'dorado' ? 'selected' : ''}>Dorado</option>
            `;
            
            select.addEventListener('change', (e) => {
                this.previsualizarUso(storageKey, e.target.value, materialSelector, img);
            });
            
            materialSelector.appendChild(select);
            bottomSection.appendChild(materialSelector);
        });
    },
    
    // Previsualizar uso de material
    previsualizarUso(storageKey, colorObjetivo, materialSelector, imgElement) {
        if (!colorObjetivo) {
            materialSelector.style.backgroundColor = this.colorNoSeleccionado;
            delete this.colorPorMaterialSeleccionado[storageKey];
            return;
        }
        
        const cantidadesActuales = {};
        for (const c in this.colorMap) {
            cantidadesActuales[c] = parseInt(this.materialStorage[storageKey][c]) || 0;
        }
        
        const resultado = this.simularUso(cantidadesActuales, colorObjetivo);
        
        if (resultado.exito) {
            const newBg = this.colorMap[colorObjetivo];
            this.colorPorMaterialSeleccionado[storageKey] = colorObjetivo;
            materialSelector.style.backgroundColor = newBg;
        } else {
            materialSelector.style.backgroundColor = this.colorNoSeleccionado;
            delete this.colorPorMaterialSeleccionado[storageKey];
            // Restablecer el valor del select
            const select = materialSelector.querySelector('select');
            select.value = '';
        }
    },
    
    // Usar materiales (aplicar cambios)
    useMaterials() {
        let materialsInView = this.currentClass === "Lord y Noble Lord" 
            ? this.materialsData[this.currentClass].common 
            : this.materialsData[this.currentClass][this.currentEquipment];
            
        // Reordenar materiales: material 3, material 1, material 2, material 4
        if (materialsInView && materialsInView.length >= 4) {
            materialsInView = [materialsInView[2], materialsInView[0], materialsInView[1], materialsInView[3]];
        }
        
        const faltantes = [];
        let cambiosAplicados = false;
        
        for (const mat of materialsInView) {
            const storageKey = `${this.currentClass}:${mat}`;
            const colorObjetivo = this.colorPorMaterialSeleccionado[storageKey];
            
            if (!colorObjetivo) continue;
            
            const originalCantidades = {};
            for (const c in this.colorMap) {
                originalCantidades[c] = parseInt(this.materialStorage[storageKey][c]) || 0;
            }
            
            const resultado = this.simularUso(originalCantidades, colorObjetivo);
            
            if (resultado.exito) {
                for (const c in resultado.stock) {
                    this.materialStorage[storageKey][c] = resultado.stock[c].toString();
                }
                cambiosAplicados = true;
            } else {
                faltantes.push(`${mat} (para ${colorObjetivo})`);
            }
        }
        
        if (faltantes.length > 0) {
            this.showMessage("Materiales Insuficientes", 
                `Los siguientes materiales no pudieron ser procesados por insuficiencia:\n${faltantes.join('\n')}`);
        }
        
        if (cambiosAplicados) {
            this.cambiosPendientes = true;
            this.showMessage("Éxito", "Materiales procesados exitosamente donde fue posible.");
        }
        
        // Limpiar selecciones
        this.colorPorMaterialSeleccionado = {};
        this.updateUI();
    },
    
    // Exportar a CSV
    exportCSV() {
        const rows = [["Clase", "Equipo", "Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"]];
        
        // Ordenar las claves para consistencia
        const sortedKeys = Object.keys(this.materialToEquipmentMap).sort();
        
        for (const key of sortedKeys) {
            const [clase, mat] = key.split(':');
            const equipoRef = this.materialToEquipmentMap[key];
            const valores = ['dorado', 'morado', 'azul', 'verde', 'blanco']
                .map(color => this.materialStorage[key][color] || '0');
            
            rows.push([clase, equipoRef, mat, ...valores]);
        }
        
        // Crear contenido CSV
        const csvContent = rows.map(row => row.join(',')).join('\n');
        
        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'materiales.csv');
        link.click();
        
        this.cambiosPendientes = false;
        this.showMessage("Éxito", "CSV exportado correctamente.");
    },
    
    // Importar desde CSV
    importCSV(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            const rows = content.split('\n');
            
            if (rows.length === 0) {
                this.showMessage("Error", "El archivo CSV está vacío.");
                return;
            }
            
            const header = rows[0].split(',');
            const expectedHeader = ["Clase", "Equipo", "Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"];
            
            if (header.join(',') !== expectedHeader.join(',')) {
                this.showMessage("Advertencia", "La cabecera del CSV no coincide. Intentando importar...");
            }
            
            let warnings = [];
            
            for (let i = 1; i < rows.length; i++) {
                if (!rows[i].trim()) continue;
                
                const row = rows[i].split(',');
                if (row.length < expectedHeader.length) {
                    warnings.push(`Fila ${i+1} muy corta, saltando.`);
                    continue;
                }
                
                const [clase, _equipoCsv, mat] = row;
                const storageKey = `${clase}:${mat}`;
                
                if (this.materialStorage[storageKey]) {
                    ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach((color, idx) => {
                        try {
                            const value = row[idx + 3].trim();
                            if (/^\d+$/.test(value)) {
                                this.materialStorage[storageKey][color] = value || '0';
                            } else {
                                warnings.push(`Valor '${value}' para ${mat} (${color}) en fila ${i+1} no es numérico. Se usará '0'.`);
                                this.materialStorage[storageKey][color] = '0';
                            }
                        } catch (e) {
                            warnings.push(`Faltan datos de color para ${mat} en fila ${i+1}. Se usará '0'.`);
                            this.materialStorage[storageKey][color] = '0';
                        }
                    });
                } else {
                    warnings.push(`Material '${mat}' (Clase: '${clase}') en fila ${i+1} no existe. Saltando.`);
                }
            }
            
            this.updateUI();
            this.cambiosPendientes = false;
            
            const message = warnings.length > 0 
                ? `CSV importado con las siguientes advertencias:\n${warnings.join('\n')}`
                : "CSV importado correctamente.";
                
            this.showMessage("Importación Completada", message);
        };
        
        reader.onerror = () => {
            this.showMessage("Error", "Error al leer el archivo CSV.");
        };
        
        reader.readAsText(file);
    },
    
    // Abrir ventana de lista de materiales
    openMaterialList() {
        const modal = document.getElementById('materials-modal');
        const tableContainer = document.getElementById('all-materials-table');
        tableContainer.innerHTML = '';
        
        const table = document.createElement('table');
        
        // Encabezados
        const headers = ["Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"];
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        table.appendChild(headerRow);
        
        // Orden específico de materiales
        const fixedMaterialOrder = [
            "Voluntad del emperador", "Guardia del emperador", "Alma del emperador", "Aliento del emperador",
            "Quijada ácida", "Oro talon", "Hoja de jade", "Ámbar hierba",
            "Carbonizado gnarl", "Acero reforzado", "Pluma Stick", "Extracto destilado",
            "Razor diente de sierra", "Piel de terciopelo", "Crystal mystic", "Tempest Stardust",
            "Maxilar", "Garra", "Hoja", "Césped",
            "Nudo", "Acero", "Pluma", "Extraer",
            "Diente de sierra", "Pelaje", "Cristal", "Stardust"
        ];
        
        // Mapeo de nombres de materiales a claves de almacenamiento
        const materialNameToStorageKeyMap = {};
        Object.keys(this.materialStorage).forEach(key => {
            const mat = key.split(':')[1];
            if (!materialNameToStorageKeyMap[mat]) {
                materialNameToStorageKeyMap[mat] = key;
            }
        });
        
        // Crear filas para cada material en orden
        fixedMaterialOrder.forEach(materialName => {
            const storageKey = materialNameToStorageKeyMap[materialName];
            if (!storageKey) return;
            
            const row = document.createElement('tr');
            
            // Celda de nombre del material con imagen
            const materialCell = document.createElement('td');
            const materialCellContent = document.createElement('div');
            materialCellContent.className = 'material-cell';
            
            const img = document.createElement('img');
            img.src = `images/${materialName.toLowerCase()}.png`;
            img.onerror = () => { img.style.display = 'none'; };
            materialCellContent.appendChild(img);
            
            const materialNameSpan = document.createElement('span');
            materialNameSpan.textContent = materialName;
            materialCellContent.appendChild(materialNameSpan);
            
            materialCell.appendChild(materialCellContent);
            row.appendChild(materialCell);
            
            // Celdas de colores
            ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
                const colorCell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'color-input';
                input.setAttribute('data-color', color);
                input.value = this.materialStorage[storageKey][color];
                input.addEventListener('input', (e) => {
                    if (/^\d*$/.test(e.target.value)) { // Solo permitir números
                        this.materialStorage[storageKey][color] = e.target.value;
                        this.cambiosPendientes = true;
                    } else {
                        e.target.value = this.materialStorage[storageKey][color]; // Restaurar valor anterior
                    }
                });
                colorCell.appendChild(input);
                row.appendChild(colorCell);
            });
            
            table.appendChild(row);
        });
        
        tableContainer.appendChild(table);
        modal.style.display = 'block';
    },
    
    // Mostrar mensaje modal
    showMessage(title, message) {
        const modal = document.getElementById('message-modal');
        document.getElementById('message-title').textContent = title;
        document.getElementById('message-text').textContent = message;
        modal.style.display = 'block';
    },
    
    // Mostrar/ocultar menú CSV móvil
    toggleMobileCSVMenu() {
        const menu = document.getElementById('mobile-csv-menu');
        if (menu.classList.contains('visible')) {
            this.hideMobileCSVMenu();
        } else {
            menu.classList.add('visible');
        }
    },
    
    // Ocultar menú CSV móvil
    hideMobileCSVMenu() {
        const menu = document.getElementById('mobile-csv-menu');
        menu.classList.remove('visible');
    },
    
    // --- Lógica de Negocio ---
    // Simular uso de materiales
    simularUso(cantidadesIniciales, colorObjetivo) {
        const ordenColores = ["blanco", "verde", "azul", "morado", "dorado"];
        
        // Trabajar con una copia del stock para la simulación
        const stockTemp = {};
        for (const k in cantidadesIniciales) {
            stockTemp[k] = parseInt(cantidadesIniciales[k]);
        }
        
        let nivelObjetivoIdx;
        try {
            nivelObjetivoIdx = ordenColores.indexOf(colorObjetivo);
            if (nivelObjetivoIdx === -1) {
                throw new Error("Color no válido");
            }
        } catch (e) {
            return { stock: {...cantidadesIniciales}, exito: false };
        }
        
        // Función para obtener material requerido
        function obtenerMaterialRequerido(targetColorName, amountNeeded) {
            const targetIdx = ordenColores.indexOf(targetColorName);
            
            // 1. Intentar usar material directo si está disponible
            if (stockTemp[targetColorName] >= amountNeeded) {
                stockTemp[targetColorName] -= amountNeeded;
                return true;
            }
            
            // 2. Si no hay suficiente directo y no es blanco, intentar fusionar
            if (targetIdx > 0) {
                const lowerTierColorName = ordenColores[targetIdx - 1];
                
                // Calcular cuánto falta
                const missingCurrentColorAmount = amountNeeded - stockTemp[targetColorName];
                
                if (missingCurrentColorAmount <= 0) {
                    return true;
                }
                
                // Cantidad de material de nivel inferior necesaria
                const requiredLowerTierAmount = missingCurrentColorAmount * 4;
                
                // Intentar obtener material de nivel inferior recursivamente
                if (obtenerMaterialRequerido(lowerTierColorName, requiredLowerTierAmount)) {
                    stockTemp[targetColorName] = Math.max(0, stockTemp[targetColorName] - amountNeeded);
                    return true;
                }
            }
            
            // 3. No se pudo obtener ni fusionar
            return false;
        }
        
        // Intentar obtener 1 unidad del color objetivo
        if (obtenerMaterialRequerido(colorObjetivo, 1)) {
            return { stock: stockTemp, exito: true };
        } else {
            return { stock: {...cantidadesIniciales}, exito: false };
        }
    }
};

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    // Confirmar antes de salir si hay cambios pendientes
    window.addEventListener('beforeunload', (e) => {
        if (app.cambiosPendientes) {
            const message = '¿Hay cambios sin guardar. ¿Seguro que deseas salir?';
            e.returnValue = message;
            return message;
        }
    });
});