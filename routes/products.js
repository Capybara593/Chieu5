var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product')
let CategoryModel = require('../schemas/category')

function buildQuery(obj){
  let result = { deletedAt: null }; // Only get non-deleted items
  if(obj.name){
    result.name = new RegExp(obj.name, 'i');
  }
  result.price = {};
  if(obj.price){
    if(obj.price.$gte){
      result.price.$gte = obj.price.$gte;
    } else {
      result.price.$gte = 0
    }
    if(obj.price.$lte){
      result.price.$lte = obj.price.$lte;
    } else {
      result.price.$lte = 10000;
    }
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

// GET all products (non-deleted only)
router.get('/', async function(req, res, next) {
  let products = await productModel.find(buildQuery(req.query)).populate("category");
  res.status(200).send({
    success: true,
    data: products
  });
});

// GET product by ID (non-deleted only)
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findOne({ _id: id, deletedAt: null });
    if(!product) {
      return res.status(404).send({
        success: false,
        message: "khong co id phu hop hoac da bi xoa mem"
      });
    }
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "khong co id phu hop"
    });
  }
});

// POST new product
router.post('/', async function(req, res, next) {
  try {
    let cate = await CategoryModel.findOne({name:req.body.category})
    if(cate){
      let newProduct = new productModel({
        name: req.body.name,
        price:req.body.price,
        quantity: req.body.quantity,
        category:cate._id
      })
      await newProduct.save();
      res.status(200).send({
        success:true,
        data:newProduct
      });
    }else{
      res.status(404).send({
        success:false,
        data:"cate khong dung"
      });
    }
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});
// PUT (Update) product
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let updateData = {};
    
    if(req.body.name) updateData.name = req.body.name;
    if(req.body.price) updateData.price = req.body.price;
    if(req.body.quantity) updateData.quantity = req.body.quantity;
    if(req.body.description) updateData.description = req.body.description;
    if(req.body.imgURL) updateData.imgURL = req.body.imgURL;
    
    if(req.body.category) {
      let cate = await CategoryModel.findOne({ name: req.body.category, deletedAt: null });
      if(cate) {
        updateData.category = cate._id;
      } else {
        return res.status(404).send({
          success: false,
          message: "category khong ton tai hoac da bi xoa mem"
        });
      }
    }

    let product = await productModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      { new: true, runValidators: true }
    );
    
    if(!product) {
      return res.status(404).send({
        success: false,
        message: "khong tim thay product hoac da bi xoa mem"
      });
    }

    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

// DELETE (Soft delete) product
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    
    if(!product) {
      return res.status(404).send({
        success: false,
        message: "khong tim thay product hoac da bi xoa mem"
      });
    }

    res.status(200).send({
      success: true,
      message: "xoa mem thanh cong",
      data: product
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;