/** 
 * Controlador de categorias 
 * maneja todas las operaciones (CRUD) relacionadas con categorias
 * 
*/

const Category = require('../models/Category');
/**
 * Create: crear nueva categoria
 * POST /api/Categories
 * Auth Bearer token requerido
 * Roles: admin y coordinador
 * body requerido:
 * name nombre de la categoria
 * description: descripcion de la categoria
 * retorna:
 * 201: categoria creada en MongoDB
 * 400: validacion fallida o nombre duplicado
 * 500: Error en base de datos
 */

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Validacion de los campos de entrada
        if (!name || typeof name !== 'string' || name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El modelo es obligatorio y debe ser texto valido'
            });
        }

        if (!description || typeof description !== 'string' || description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'La description es obligatorioa y debe ser texto valido'
            });
        }

        // Limpiar espacios en blanco
        const trimmedName = name.trim();
        const trimmedDesc = description.trim();

        // Verificar si ya existe una categoria con el mismo nombre
        const existingCategory = await Category.findOne({ name: trimmedName });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoria con ese nombre'
            });
        }

        // Crear nueva categoria 
        const newCategory = new Category({
            name: trimmedName,
            description: trimmedDesc
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Categoria creada exitosamente',
            data: newCategory
        });
    } catch (error) {
        console.error('Error en createCategory:', error);
        // Manejo de errores de indice unico
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoria con ese nombre'
            });
        }

        // Error generico del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear categoria',
            error: error.message
        });
    }
};

/**
 * GET consultar listado de categorias
 * GET /api/categories
 * por defecto retorna solo las categorias activas
 * con includeInactive=true retorna todas las categorias incluyendo las inactivas
 * Ordena por desendente por fecha de creacion
 * retorna:
 * 200: lista de categorias
 * 500: error de base de datos
 */

exports.getCategories = async (req, res) => {
    // Por defecto solo las categorias activas
    // IncludeInactive=true permite ver desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : {
    active: { $ne: false } };

    const categories = await Category.find(activeFilter).sort({ createdAt: -1});
    res.status(200).json({
        success: true,
        data: categories
    });
};