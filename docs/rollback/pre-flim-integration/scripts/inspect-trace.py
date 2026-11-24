import zipfile, json, glob
for path in glob.glob('test-results/exhibition-hero*/trace.zip'):
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if name.endswith('.trace'):
                events=[]
                for line in archive.read(name).decode('utf8').splitlines():
                    item=json.loads(line)
                    if item.get('type') in ('before','after','console','event'):
                        if item.get('type')=='before': events.append({'type':'before','api':item.get('apiName'), 'method':item.get('method'),'params':str(item.get('params'))[:240]})
                        elif item.get('error'): events.append({'type':'error','error':item['error']})
                        elif item.get('type')=='console': events.append({'type':'console','message':item.get('text')})
                print(name,json.dumps(events[-30:],indent=2))
