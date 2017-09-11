/* jshint esnext:true */

const Main = imports.ui.main;
const Lang = imports.lang;

let signalConnections = [];


function init()
{
	/* no initialization required */
}

function enable()
{
    Main.panel.actor.get_children().forEach(
        function(actor) {
            let connection = {
                object: actor,
                id: actor.connect('actor-added', function(child) {
                    recursiveEdit(child, true);
                })
            };
            signalConnections.push(connection);

            actor.get_children().forEach(function(child) {
                recursiveEdit(child, true);
            });
        });
}

function disable()
{
    while (signalConnections.length > 0)
    {
        let connection = signalConnections.pop();
        connection.object.disconnect(connection.id);

        recursiveEdit(connection.object, false);
    }
}

function recursiveEdit(widget, hide)
{
    if (widget.text === '\u25BE' || widget.text === '\u25B4' || // regular text drop down arrow (3.10)
       (widget.has_style_class_name && widget.has_style_class_name('popup-menu-arrow'))) // image drop down arrow (3.12)
    {
        if (hide)
        {
            widget.hide();
        }
        else
        {   
            widget.show();
        }
        
        return;
    }
    
    if (typeof widget.get_children !== 'undefined')
    {
        widget.get_children().forEach(function(child) { recursiveEdit(child, hide); });
    }
}
