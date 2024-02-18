export let SavageRollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SavageRollHandler = class SavageRollHandler extends coreModule.api.RollHandler {
        
        async handleActionClick(event, encodedValue) {
            let payload = encodedValue.split("|");

            let macroType = payload[0];
            let tokenId = this.token.id;
            let actionId = payload[1];

            let actor = this.actor;

            let hasSheet = ["item"];
            if (this.isRenderItem() && hasSheet.includes(macroType)) {
                return this.renderItem(tokenId, actionId);
            }

            switch (macroType) {
                case "ae":
                    const item = this.token.actor.items.filter(el => el.id === payload[3])[0];
                    let disabled = true;
                    if(payload[2] == 'true') disabled = false;
                    const updates = {
                        _id: actionId,
                        disabled: disabled,
                      };
              
                    item.updateEmbeddedDocuments('ActiveEffect', [updates]);
                    Hooks.callAll("forceUpdateTokenActionHud");
                    break;
                case "actions":
                case "item":
                case "weapons":
                case "gears":
                case "consumables":
                case "powers":
                    const tokenType = this.actor.type;
                    if(tokenType == "vehicle" && macroType === "weapons") {
                        const driver = await fromUuid(this.actor.system.driver.id)
                        const weaponToCopy = this.actor.items.filter(item => item.id === actionId)[0]
                        let itemData = duplicate(weaponToCopy);
                        const item = await driver.createEmbeddedDocuments("Item", [itemData]);
                        await this._rollItem(event, item[0].id, driver)
                        // allow BR2 to roll from the card
                        setTimeout(function(){ driver.deleteEmbeddedDocuments("Item", [item[0].id]); }, 60000);
                        
                    } else {
                        this._rollItem(event, actionId,this.token.actor);
                    }
                    break;
                case "effects":
                case "statuses":
                    await this._toggleStatus(macroType, actionId);
                    break;
                case "benny":
                    this._adjustBennies(event, actionId);
                    break;
                case "gmBenny":
                    await this._adjustGmBennies(event, actionId);
                    break;
                case "attributes":
                    this._rollAttribute(event, actionId);
                    break;
                case "runningDie":
                    this._run();
                    break;
                case "skills":
                    this._rollSkill(event, actionId, this.token.actor);
                    break;
                case "utility":
                    if (actionId === "endTurn") {
                        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
                    }
                    break;
                case "wounds":
                case "fatigue":
                case "powerPoints":
                    if(actionId != "NONE")
                        this._wounds(macroType,actor,actionId)
                break;
                case "maneuver":
                    const driver = await fromUuid(this.actor.system.driver.id)
                    this._rollSkill(event, actionId, driver);
                    break;
            }
        }

        _run() {
            this.token.actor.rollRunningDie();
        }

        _wounds(event,actor,actionId) {
            let update = { data: { } };
            let poll = actionId.split(">")
            if(poll.length == 2) actionId = poll[0]
            if(actionId == "add") {
                if(event == 'powerPoints') {
                    let p = poll[1]
                    update["data"][event] = {}
                    update["data"][event][p] = {
                        value: this.token.actor.system[event][p].value + 1
                    }
                } else {
                    update["data"][event]= {
                        value: this.token.actor.system[event].value + 1
                    }
                }
            }
            else if(actionId == "remove") {
                if(event == 'powerPoints') {
                    let p = poll[1]
                    update["data"][event] = {}
                    update["data"][event][p]= {
                        value: this.token.actor.system[event][p].value - 1
                    }
                } else if(actor.system[event].value > 0) {
                    update["data"][event]= {
                        value: this.token.actor.system[event].value - 1
                    }
                }
                
            }
            actor.update(update)
        }

        /** @private */
        async _rollItem(event, actionId, actor) {
            const item = actor.items.filter(el => el.id === actionId)[0];
            await item.show();
        }

        /** @private */
        async _toggleStatus(event, actionId) {
            if(event != "effects") {
                const existsOnActor = this.token.actor.statuses.has(actionId.toLowerCase())
                const data = game.swade.util.getStatusEffectDataById(actionId.toLowerCase());
                data["flags.core.statusId"] = actionId.toLowerCase();
                await this.token.toggleEffect(data, { active: !existsOnActor });
                
            } else {
                let effect = this.token.actor.effects.filter(el => el.id === actionId)
                if(effect.length == 0) {
                    const items = Array.from(this.actor.items.filter(it => ['edge', 'hindrance', 'ability'].includes(it.type)))
                    items.forEach(async (item) => {
                        let _eff = item.effects.filter(el => el.id === actionId)
                        if(_eff.length > 0) 
                            await _eff[0].update({ disabled: !_eff[0].disabled })
                    })
                } else {
                    await this.token.actor.effects.filter(el => el.id === actionId)[0].update({ disabled: !effect[0].disabled })
                }

                
            }
            game.tokenActionHud.update()
        }

        /** @private */
        _adjustBennies(event, actionId) {
            if (actionId === "spend") {
                this.token.actor.spendBenny()
            } else if (actionId === "give") {
                this.token.actor.getBenny()
            }
        }

        /** @private */
        async _adjustGmBennies(event, actionId) {
            let user = game.user;
            if (!user.isGM) return;

            const benniesValue = user.getFlag("swade", "bennies");
            if (actionId === "spend") {
                game.user.spendBenny()
            } else if (actionId === "give") {
                game.user.getBenny()
            }

            Hooks.callAll("forceUpdateTokenActionHUD");
        }

        /** @private */
        _rollAttribute(event, actionId) {
            this.token.actor.rollAttribute(actionId, { event: event });
        }

        /** @private */
        _rollSkill(event, actionId, actor) {
            actor.rollSkill(actionId, { event: event });
        }

        /** @private */
        async _adjustAttributes(event, actor, macroType, actionId) {
            const actionIdArray = actionId.split(">");
            const changeType = actionIdArray[0];
            const pool = (actionIdArray.length > 0) ? actionIdArray[1] : null;
            let attribute = (macroType === 'powerPoints')
                ? actor.system[macroType][pool]
                : actor.system[macroType];

            if (!attribute) return;

            const curValue = attribute.value;
            const max = attribute.max;
            const min = attribute.min ?? 0;

            let value;
            switch (changeType) {
                case "increase":
                    value = Math.clamped(curValue + 1, min, max);
                    break;
                case "decrease":
                    value = Math.clamped(curValue - 1, min, max);
                    break;
            }

            let update = { data: {} };

            update.data[macroType] = (macroType === 'powerPoints')
                ? { [pool]: { value: value } }
                : { value: value };

            await actor.update(update);
        }

    }
})