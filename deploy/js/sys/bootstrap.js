/**
	Sequentially loads up all necessary system scripts
*/
(function()
{
	var startTime = new Date().getTime();
	var scriptPath = 'js/sys/';
	var scripts = 
		[
			{
				file: 'debug.js'
			}, 
			{
				file: 'global.js'
			},
			{
				file: 'package_manager.js',
				deps: ['package_list.js']
			}
		];
	var scriptIndex = 0;
	var depList;

	(function init()
	{
		var sys = 
		{
			IS_DEBUG: true,
			scriptLoaded: scriptLoaded,
			depLoaded: depLoaded
		};
		window.sys = sys;
		loadNextScript();
	})();

	function loadNextScript()
	{
		console.log('file:', scripts[scriptIndex].file, showTotalPercent());
		if (scripts[scriptIndex].deps)
		{
			delete sys.args;
			depList = [];
			loadNextDep();
		}
		else
		{
			loadScript(scripts[scriptIndex].file);
		}
	}

	function loadNextDep()
	{
		var list = scripts[scriptIndex].deps;
		if (list.length == depList.length) 
		{
			sys.args = depList;
			// finished loading deps, load the main file
			loadScript(scripts[scriptIndex].file);
		}
		else
		{
			console.log('dep:', list[depList.length], showDepsPercent(), showTotalPercent());
			// use the depList length for counting
			var dep = list[depList.length];
			loadScript(dep);
		}
	}

	function showTotalPercent()
	{
		return showLoadedPercent('total', Math.floor((scriptIndex + 1) / scripts.length * 100));
	}

	function showDepsPercent()
	{
		return showLoadedPercent('dep', Math.floor((depList.length + 1) / scripts[scriptIndex].deps.length * 100));
	}

	function showLoadedPercent(id, val)
	{
		return '(' + id + ': ' + val + '%)';
	}

	function depLoaded(data)
	{
		// file may be getting written to so attempt to access again
		if (data == undefined)
		{
			console.log('file inaccessible, attempting reload');
			setTimeout(loadNextDep, 1000);
			return;
		}
		depList.push(data);
		loadNextDep();
	}

	function loadScript(filePath)
	{
		var script = document.createElement('script');
		script.src = scriptPath + filePath;
		document.head.appendChild(script);
	}

	function scriptLoaded()
	{
		scriptIndex++;
		if (scriptIndex > scripts.length - 1)
		{
			loadApp();
			return;
		}

		loadNextScript();
	}
	/**
		e.g.
		<script id="sys"
			data-src="js/vendor/require/require.js" 	// source to load once sys is done
			data-attr="data-main=js/skull/config.js" 	// comma-separated attributes to set on script tag
			src="js/sys/bootstrap.js">
		</script>
	*/
	function loadApp()
	{
		delete sys.args;
		
		var config = document.getElementById('sys');

		var script = document.createElement('script');
		var src = config.getAttribute('data-src');
		var attrs = config.getAttribute('data-attr');
		if (attrs)
		{
			attrs = attrs.split(',');
			for (var i = 0; i < attrs.length; i++)
			{
				var name = attrs[i].split('='), 
					val = name[1], 
					name = name[0];
				script.setAttribute(name, val);
			}
		}
		script.src = src;
		document.head.appendChild(script);
		console.log('setup time:', new Date().getTime() - startTime + 'ms');
	}
	
})();