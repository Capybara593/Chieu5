var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category')

// GET all categories (non-deleted only)
router.get('/', async function(req, res, next) {
  let categories = await categoryModel.find({ deletedAt: null });
  res.status(200).send({
    success: true,
    data: categories
  });
});

// GET category by ID (non-deleted only)
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let category = await categoryModel.findOne({ _id: id, deletedAt: null });
    if(!category) {
      return res.status(404).send({
        success: false,
        message: "khong tim thay category hoac da bi xoa mem"
      });
    }
    res.status(200).send({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "khong co id phu hop"
    });
  }
});

// POST new category
router.post('/', async function(req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name,
      description: req.body.description || ""
    });
    await newCategory.save();
    res.status(200).send({
      success: true,
      data: newCategory
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// PUT (Update) category
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let updateData = {};
    
    if(req.body.name) updateData.name = req.body.name;
    if(req.body.description) updateData.description = req.body.description;

    let category = await categoryModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      { new: true, runValidators: true }
    );
    
    if(!category) {
      return res.status(404).send({
        success: false,
        message: "khong tim thay category hoac da bi xoa mem"
      });
    }

    res.status(200).send({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

// DELETE (Soft delete) category
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let category = await categoryModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    
    if(!category) {
      return res.status(404).send({
        success: false,
        message: "khong tim thay category hoac da bi xoa mem"
      });
    }

    res.status(200).send({
      success: true,
      message: "xoa mem thanh cong",
      data: category
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;