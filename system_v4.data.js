(async function() {
    try {
        const _p = "Y29yZS5odG1s"; 
        const _target = atob(_p);

        const response = await fetch("./" + _target);
        if (!response.ok) return;

        const html = await response.text();
        
        document.open();
        document.write(html);
        document.write(`<script>
            document.oncontextmenu = () => false;
            document.onkeydown = e => {
                if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || (e.ctrlKey && e.keyCode == 85)) return false;
            };
            setInterval(() => { debugger; }, 100);
        <\/script>`);
        document.close();
    } catch (e) {}
})();
