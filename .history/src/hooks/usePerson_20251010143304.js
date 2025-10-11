      setTimeout(() => setSuccess(false), 3000);
      return response;
    } catch (err) {
      console.error("Error en editPerson:", err);
      setError(err.message || "Error al editar empleado");
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };
  // Inicializar carga en mount
  useEffect(() => {
    getPersons();
  }, []);
  return {
    persons,
    getPersons,
    createPerson,
    editPerson,
    loading,
    error,
    success,
  };
};
export default usePerson;