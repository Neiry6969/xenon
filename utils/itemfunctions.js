const ItemModel = require("../models/itemSchema");

class Itemfunctions {
    static async fetchItemData(itemString) {
        let itemData;
        const absoluteFind = await ItemModel.findOne({
            item: itemString,
        });
        const relativeFind = await ItemModel.findOne({
            item: { $gt: itemString },
        });

        if (absoluteFind) {
            itemData = absoluteFind;
        } else {
            itemData = relativeFind;
        }
        return itemData;
    }

    static async fetchAllitemsData() {
        return await ItemModel.find({});
    }
}

module.exports = Itemfunctions;
