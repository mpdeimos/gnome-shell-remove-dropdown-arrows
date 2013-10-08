const Main = imports.ui.main;

function init() { /* no initialization required */ }

function enable()
{
	if (typeof Main.panel.statusArea.appMenu._arrow !== 'undefined')
	{
		Main.panel.statusArea.appMenu._arrow.hide();
	}
	if (typeof Main.panel.statusArea.aggregateMenu._indicators !== 'undefined')
	{
		let indicators =  Main.panel.statusArea.aggregateMenu._indicators;
		indicators.get_child_at_index(indicators.get_n_children()-1).hide();
	}
}

function disable() {
	if (typeof Main.panel.statusArea.appMenu._arrow !== 'undefined')
	{
		Main.panel.statusArea.appMenu._arrow.show();
	}
	if (typeof Main.panel.statusArea.aggregateMenu._indicators !== 'undefined')
	{
		let indicators =  Main.panel.statusArea.aggregateMenu._indicators;
		indicators.get_child_at_index(indicators.get_n_children()-1).show();
	}
}
