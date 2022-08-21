const ItemModel = require("../models/itemSchema");

class Itemfunctions {
    static async fetchItemData(itemString) {
        const allItems = await ItemModel.find({});
        let itemData;
        const absoluteFind = await ItemModel.findOne({
            item: itemString,
        });

        const itemssearch = allItems.filter((value) => {
            return value.item.includes(itemString);
        });
        const semiabsoluteFind = itemssearch[0];

        const relativeFind = await ItemModel.findOne({
            item: { $gt: itemString },
        });

        if (absoluteFind) {
            itemData = absoluteFind;
        } else if (semiabsoluteFind) {
            itemData = semiabsoluteFind;
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
