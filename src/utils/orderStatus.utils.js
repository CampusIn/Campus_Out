import orderModel from "../models/order.models.js";

const orderStatusPipeline = async(restaurantId)=>{
    const orderStatus = await orderModel.aggregate([
        {
            $match:{
                restaurant:restaurantId
            }
        },{
            $group:{
                _id:'$orderStatus',
                count:{
                    $sum:1
                }
            }
        },{
            $project:{
                _id:0,
                orderStatus:'$_id',
                count:1
            }
        },{
            $sort:{
                count:-1
            }
        }
    ])

    return orderStatus
}

export default orderStatusPipeline