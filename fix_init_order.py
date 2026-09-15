import codecs

path = 'c:/Users/vhoyos/Desktop/Prueba2/Mchav-Analytics-Frontend/src/features/reports/views/CentroReportesView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

bad_code = '''  const [searchGeneralQuery, setSearchGeneralQuery] = useState('');
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setValidationError(null);
  }, [reportType, reportParam, genProjectId]);
  const [genProjectId, setGenProjectId] = useState(selectedProjectId || '');'''

good_code = '''  const [searchGeneralQuery, setSearchGeneralQuery] = useState('');
  const [genProjectId, setGenProjectId] = useState(selectedProjectId || '');
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setValidationError(null);
  }, [reportType, reportParam, genProjectId]);'''

if bad_code in content:
    content = content.replace(bad_code, good_code)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Fixed initialization order!")
else:
    print("Could not find bad code exactly as written.")
