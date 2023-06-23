
export function swade_rollhandler(macroType, actionId, itemId, actor) {
    
    switch(macroType) {
        case "attributes":
            actor.rollAttribute(actionId.toLowerCase());
            break;
        case "skills":
            actor.rollSkill(actionId);
            break;
        case "powers":
        case "weapons":
        case "consumables":
        case "gears":
        case "actions":
            let items = actor.items.filter(i => i.id === actionId)
            items[0].show()
    }
}
function  doRenderItem(actor, itemId) {
    let item = actor.items.filter(el => el.id == itemId)[0]
    item.sheet.render(true);
}

function rollItem(event, actor, actionId, token) {
    //const item = super.getItem(actor, actionId);
    //item.show();
    let behavior;
    if (event.ctrlKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
    } else if (event.altKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "alt_click");
    } else if (event.shiftKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "shift_click");
    } else {
      behavior = game.settings.get("betterrolls-swade2", "click");
    }
    if (behavior === "trait") {
      game.brsw
        .create_item_card_from_id(token.id, actor.id, actionId)
        .then((message) => {
          game.brsw.roll_item(message, $(message.data.content), false);
        });
    } else if (behavior === "trait_damage") {
      game.brsw
        .create_item_card_from_id(token.id, actor.id, actionId)
        .then((message) => {
          game.brsw.roll_item(message, $(message.data.content), false, true);
        });
    } else if (behavior === "system") {
      game.swade.rollItemMacro(actor.items.get(actionId).name);
    } else {
      game.brsw.create_item_card_from_id(token.id, actor.id, actionId);
    }
  }

export async function br2_rollhandler(event, macroType, actionId, itemId, actor, token) {
    console.log("BROLL2")
    console.log(actionId)
    let hasSheet = ["item"];
    /*if (this.isRenderItem() && hasSheet.includes(macroType))
      return doRenderItem(actor, actionId);
*/
    switch (macroType) {
      case "gears":
      case "consumables":
        await game.brsw.create_item_card_from_id(token.id, actor.id, actionId)
        break
      case "attributes":
        //console.log(actor.system.attributes[actionId])
        await game.brsw.create_attribute_card_from_id(token.id, actor.id, "vigor")
      case "skills":
            await game.brsw.create_skill_card_from_id(token.id, actor.id, actionId)
        break
      case "weapons":
            await game.brsw.create_item_card_from_id(token.id, actor.id, actionId)
            
            //doRenderItem(actor, actionId)
        //rollItem(event, actor, actionId, token);
      /*case "utility":
        if (actionId === "endTurn") {
          if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        }*/
        break;
    }
}